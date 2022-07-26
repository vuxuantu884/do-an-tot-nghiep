import { KDGroup } from "model/report";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { calculateTargetMonth, getDataManyQueryKeyDriverOffline, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import {
    STORES_PRODUCT_TOTAL_SALES_DAY_QUERY,
    STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY
} from "../config/key-driver-offline-asm-config";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresProductTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresProductTotalSales, setIsFetchingStoresProductTotalSales] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    const fetchProductTotalSale = async () => {
      setIsFetchingStoresProductTotalSales(true);
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      const res = await getDataManyQueryKeyDriverOffline(
        dispatch,
        moment().date() > 1
          ? [STORES_PRODUCT_TOTAL_SALES_DAY_QUERY(selectedAsm[0], selectedStores), STORES_PRODUCT_TOTAL_SALES_MONTH_QUERY(selectedAsm[0], selectedStores)]
          : [STORES_PRODUCT_TOTAL_SALES_DAY_QUERY(selectedAsm[0], selectedStores)]
      );

      if (!res?.length) {
        showErrorReport("Lỗi khi lấy dữ liệu Doanh thu theo nhóm sản phẩm");
        setIsFetchingStoresProductTotalSales(false);
        return;
      }
      const { data: resDayData } = res[0].result;
      setData((prev: any) => {
        const storesProductTotalSales: any = prev[1];
        const childrenProduct: any[] = storesProductTotalSales.children;
        resDayData.forEach((item, index) => {
          if (item && item[0]) {
            const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
            const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
            if (idx !== -1) {
              childrenProduct[idx].name = item[0];
              childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`] = item[2];
              childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_targetMonth`] = calculateTargetMonth(item[2]);
            } else {
              childrenProduct.push({
                key: itemKey,
                name: item[0],
                [`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`]: item[2],
                [`${nonAccentVietnameseKD(item[1])}_targetMonth`]: calculateTargetMonth(item[2]),
              })
            }
          } 
        });
        if (res[1]?.result) {
          const { data: resMonthData } = res[1].result;
          resMonthData.forEach((item, index) => {
            if (item && item[0]) {
              const itemKey = `${nonAccentVietnameseKD(item[0])}${KDGroup.SKU3}`;
              const idx = childrenProduct.findIndex((product: any) => product?.key === itemKey);
              if (idx !== -1) {
                childrenProduct[idx].name = item[0];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`] = item[2];
                childrenProduct[idx][`${nonAccentVietnameseKD(item[1])}_targetMonth`] = calculateTargetMonth(item[2]);
              } else {
                childrenProduct.push({
                  key: itemKey,
                  name: item[0],
                  [`${nonAccentVietnameseKD(item[1])}_accumulatedMonth`]: item[2],
                  [`${nonAccentVietnameseKD(item[1])}_targetMonth`]: calculateTargetMonth(item[2]),
                })
              }
            } 
          });
        }
        storesProductTotalSales.children = childrenProduct;
        prev[1] = storesProductTotalSales;
        return [...prev];
      });
      setIsFetchingStoresProductTotalSales(false);
    };
    fetchProductTotalSale();
  }, [dispatch, selectedAsm, selectedStores, setData]);

  return { isFetchingStoresProductTotalSales };
}

export default useFetchStoresProductTotalSales;
