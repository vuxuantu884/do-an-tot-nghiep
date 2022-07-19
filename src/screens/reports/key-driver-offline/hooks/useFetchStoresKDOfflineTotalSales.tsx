import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnamese } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresKDOfflineTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresKDOfflineTotalSales, setIsFetchingStoresKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver) => {
        const asmName = nonAccentVietnamese(asmData['pos_location_name']);
        if (data.key === keyDriver && asmName) {
          data[`${asmName}_${columnKey}`] = asmData[keyDriver];
          if (columnKey === 'accumulatedMonth' && !['average_order_value', 'average_customer_spent'].includes(keyDriver)) {
            data[`${asmName}_targetMonth`] = calculateTargetMonth(data[`${asmName}_accumulatedMonth`]);
          }
        } else {
          if (data.children?.length) {
            data.children.forEach((item: any) => {
              findKeyDriverAndUpdateValue(item, asmData, columnKey);
            });
          }
        }
      });
    },
    []
  );

  const refetchStoresKDOfflineTotalSales = useCallback(() => {
    const fetchStoresKDOfflineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresKDOfflineTotalSales(true);      
      const resDay = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm
      });

      if (!resDay) {
        showErrorReport("Lỗi khi lấy dữ liệu thực đạt doanh thu offline");
        setIsFetchingStoresKDOfflineTotalSales(false);
        return;
      }

      setData((prev: any) => {
        let dataPrev: any = prev[0];
        resDay.forEach((item: any) => {
          findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
        });
        return [dataPrev];
      });

      if (moment().date() > 1) {
        const resMonth = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
          from: START_OF_MONTH,
          to: YESTERDAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm
        });
        if (!resMonth) {
          showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          setIsFetchingStoresKDOfflineTotalSales(false);
          return;
        }
  
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resMonth.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'accumulatedMonth');
          });
          return [dataPrev];
        });
      }

      setIsFetchingStoresKDOfflineTotalSales(false);
    };
    fetchStoresKDOfflineTotalSales();
  }, [dispatch, findKeyDriverAndUpdateValue, selectedAsm, setData, selectedStores]);

  useEffect(() => {
    refetchStoresKDOfflineTotalSales();
  }, [refetchStoresKDOfflineTotalSales]);

  return { isFetchingStoresKDOfflineTotalSales, refetchStoresKDOfflineTotalSales };
}

export default useFetchStoresKDOfflineTotalSales;
