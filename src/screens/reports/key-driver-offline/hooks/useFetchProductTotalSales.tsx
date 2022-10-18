import { KDGroup, KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  getDataManyQueryKeyDriverOffline,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import {
  PRODUCT_TOTAL_SALES_DAY_QUERY,
  PRODUCT_TOTAL_SALES_MONTH_QUERY,
} from "../config/key-driver-offline-asm-config";
import { KDOfflineContext } from "../provider/kd-offline-provider";

function useFetchProductTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KDOfflineContext);

  const [isFetchingProductTotalSales, setIsFetchingProductTotalSales] = useState<
    boolean | undefined
  >();

  const calculateCompanyKeyDriver = useCallback((response) => {
    const companyData = response.reduce((res: any[], item: any[]) => {
      if (item[0]) {
        const idx = res.findIndex((companyItem: any[]) => companyItem[0] === item[0]);
        if (idx !== -1) {
          res[idx][2] += item[2];
        } else {
          res.push([item[0], "COMPANY", item[2]]);
        }
      }
      return res;
    }, []);
    return companyData;
  }, []);

  useEffect(() => {
    const fetchProductTotalSale = async () => {
      setIsFetchingProductTotalSales(true);
      const { YYYYMMDD } = DATE_FORMAT;
      let res: any[];
      if (selectedDate === moment().format(YYYYMMDD)) {
        res = await getDataManyQueryKeyDriverOffline(
          dispatch,
          moment(selectedDate, YYYYMMDD).date() > 1
            ? [
                PRODUCT_TOTAL_SALES_DAY_QUERY(selectedDate),
                PRODUCT_TOTAL_SALES_MONTH_QUERY(selectedDate),
              ]
            : [PRODUCT_TOTAL_SALES_DAY_QUERY(selectedDate)],
        );
      } else {
        res = await getDataManyQueryKeyDriverOffline(dispatch, [
          PRODUCT_TOTAL_SALES_DAY_QUERY(selectedDate),
          PRODUCT_TOTAL_SALES_MONTH_QUERY(selectedDate),
        ]);
      }

      if (!res?.length) {
        showErrorReport("Lỗi khi lấy dữ liệu Doanh thu theo nhóm sản phẩm");
        setIsFetchingProductTotalSales(false);
        return;
      }
      const { data: resDayData } = res[0].result;
      setData((prev: any) => {
        const productTotalSales: any = prev.find(
          (item: any) => item.key === KeyDriverField.ProductTotalSales,
        );
        const childrenProduct: any[] = productTotalSales.children;
        const companyDayData = calculateCompanyKeyDriver(resDayData);
        [...companyDayData, ...resDayData].forEach((item, index) => {
          if (item && item[0]) {
            const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
            const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
            if (idx !== -1) {
              childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_actualDay`] = item[2];
            } else {
              childrenProduct.push({
                key: itemKey,
                name: item[0],
                [`${nonAccentVietnameseKD(item[1])}_actualDay`]: item[2],
              });
            }
          }
        });
        if (res[1]?.result) {
          const { data: resMonthData } = res[1].result;
          const companyMonthData = calculateCompanyKeyDriver(resMonthData);
          [...companyMonthData, ...resMonthData].forEach((item, index) => {
            if (item && item[0]) {
              const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
              const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
              if (idx !== -1) {
                childrenProduct[idx].name = item[0];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`] =
                  item[2];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_targetMonth`] =
                  calculateTargetMonth(item[2], selectedDate);
              } else {
                childrenProduct.push({
                  key: itemKey,
                  name: item[0],
                  [`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`]: item[2],
                  [`${nonAccentVietnameseKD(item[1])}_targetMonth`]: calculateTargetMonth(
                    item[2],
                    selectedDate,
                  ),
                });
              }
            }
          });
        }
        productTotalSales.children = childrenProduct;
        return [...prev];
      });
      setIsFetchingProductTotalSales(false);
    };
    if (selectedDate) {
      fetchProductTotalSale();
    }
  }, [calculateCompanyKeyDriver, dispatch, selectedDate, setData]);

  return { isFetchingProductTotalSales };
}

export default useFetchProductTotalSales;
