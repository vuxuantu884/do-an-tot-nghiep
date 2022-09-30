import { KDGroup, KeyDriverDimension, KeyDriverField } from "model/report";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  getDataManyQueryKeyDriverOffline,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import {
  STAFFS_PRODUCT_TOTAL_SALES_DAY_QUERY,
  STAFFS_PRODUCT_TOTAL_SALES_MONTH_QUERY,
  STORES_PRODUCT_TOTAL_SALES_DAY_QUERY,
  STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY,
} from "../config/key-driver-offline-asm-config";
import { kdNumber } from "../constant/kd-offline-template";
import { KDOfflineContext } from "../provider/kd-offline-provider";

function useFetchStoresProductTotalSales(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const {
    setData,
    selectedStores,
    selectedAsm,
    selectedStaffs,
    selectedDate,
    selectedAllStores,
    data,
  } = useContext(KDOfflineContext);

  const [isFetchingStoresProductTotalSales, setIsFetchingStoresProductTotalSales] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    const fetchProductTotalSale = async () => {
      if (data.length < kdNumber) {
        return;
      }
      setIsFetchingStoresProductTotalSales(true);
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      const selectedStaffCodes = selectedStaffs.map((staff) =>
        JSON.parse(staff).code.toLocaleLowerCase(),
      );
      const { YYYYMMDD } = DATE_FORMAT;
      let res: any[];
      if (selectedDate === moment().format(YYYYMMDD)) {
        res = await getDataManyQueryKeyDriverOffline(
          dispatch,
          moment(selectedDate, YYYYMMDD).date() > 1
            ? dimension === KeyDriverDimension.Staff
              ? [
                  STAFFS_PRODUCT_TOTAL_SALES_DAY_QUERY(
                    selectedAsm[0],
                    selectedStores,
                    selectedStaffCodes,
                    selectedDate,
                  ),
                  STAFFS_PRODUCT_TOTAL_SALES_MONTH_QUERY(
                    selectedAsm[0],
                    selectedStores,
                    selectedStaffCodes,
                    selectedDate,
                  ),
                ]
              : [
                  STORES_PRODUCT_TOTAL_SALES_DAY_QUERY(
                    selectedAsm[0],
                    selectedStores,
                    selectedDate,
                    selectedAllStores,
                  ),
                  STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY(
                    selectedAsm[0],
                    selectedStores,
                    selectedDate,
                    selectedAllStores,
                  ),
                ]
            : dimension === KeyDriverDimension.Staff
            ? [
                STAFFS_PRODUCT_TOTAL_SALES_DAY_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedStaffCodes,
                  selectedDate,
                ),
              ]
            : [
                STORES_PRODUCT_TOTAL_SALES_DAY_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedDate,
                  selectedAllStores,
                ),
              ],
        );
      } else {
        res = await getDataManyQueryKeyDriverOffline(
          dispatch,
          dimension === KeyDriverDimension.Staff
            ? [
                STAFFS_PRODUCT_TOTAL_SALES_DAY_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedStaffCodes,
                  selectedDate,
                ),
                STAFFS_PRODUCT_TOTAL_SALES_MONTH_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedStaffCodes,
                  selectedDate,
                ),
              ]
            : [
                STORES_PRODUCT_TOTAL_SALES_DAY_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedDate,
                  selectedAllStores,
                ),
                STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY(
                  selectedAsm[0],
                  selectedStores,
                  selectedDate,
                  selectedAllStores,
                ),
              ],
        );
      }

      if (!res?.length) {
        showErrorReport("Lỗi khi lấy dữ liệu Doanh thu theo nhóm sản phẩm");
        setIsFetchingStoresProductTotalSales(false);
        return;
      }
      const { data: resDayData } = res[0].result;
      setData((prev: any) => {
        const dimName = dimension === KeyDriverDimension.Staff ? selectedStores[0] : selectedAsm[0];
        const storesProductTotalSales: any = prev.find(
          (item: any) => item.key === KeyDriverField.ProductTotalSales,
        );
        const childrenProduct: any[] = storesProductTotalSales.children;
        resDayData.forEach((item: any) => {
          if (item && item[0]) {
            const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
            const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
            if (idx !== -1) {
              childrenProduct[idx].name = item[0];
              childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_actualDay`] = item[2];
              childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_actualDay`] =
                (childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_actualDay`] || 0) +
                item[2];
            } else {
              childrenProduct.push({
                key: itemKey,
                name: item[0],
                [`${nonAccentVietnameseKD(item[1])}_actualDay`]: item[2],
                [`${nonAccentVietnameseKD(dimName)}_actualDay`]: item[2],
              });
            }
          }
        });
        if (res[1]?.result) {
          const { data: resMonthData } = res[1].result;
          resMonthData.forEach((item: any) => {
            if (item && item[0]) {
              const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
              const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
              if (idx !== -1) {
                childrenProduct[idx].name = item[0];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`] =
                  item[2];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_targetMonth`] =
                  calculateTargetMonth(item[2], selectedDate);
                childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_accumulatedMonth`] =
                  (childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_accumulatedMonth`] ||
                    0) + item[2];
                childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_targetMonth`] =
                  calculateTargetMonth(
                    childrenProduct[idx][`${nonAccentVietnameseKD(dimName)}_accumulatedMonth`],
                    selectedDate,
                  );
              } else {
                childrenProduct.push({
                  key: itemKey,
                  name: item[0],
                  [`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`]: item[2],
                  [`${nonAccentVietnameseKD(item[1])}_targetMonth`]: calculateTargetMonth(
                    item[2],
                    selectedDate,
                  ),
                  [`${nonAccentVietnameseKD(dimName)}_accumulatedMonth`]: item[2],
                  [`${nonAccentVietnameseKD(dimName)}_targetMonth`]: calculateTargetMonth(
                    item[2],
                    selectedDate,
                  ),
                });
              }
            }
          });
        }
        storesProductTotalSales.children = childrenProduct;
        return [...prev];
      });
      setIsFetchingStoresProductTotalSales(false);
    };
    if (selectedDate) {
      fetchProductTotalSale();
    }
  }, [
    data.length,
    dimension,
    dispatch,
    selectedAllStores,
    selectedAsm,
    selectedDate,
    selectedStaffs,
    selectedStores,
    setData,
  ]);

  return { isFetchingStoresProductTotalSales };
}

export default useFetchStoresProductTotalSales;
