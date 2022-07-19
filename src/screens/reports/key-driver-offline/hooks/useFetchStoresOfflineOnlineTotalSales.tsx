import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineOnlineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnamese } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresOfflineOnlineTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresOfflineOnlineTotalSales, setIsFetchingStoresOfflineOnlineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver) => {
        const asmName = nonAccentVietnamese(asmData['pos_location_name']);
        if (data.key === keyDriver && asmName) {
          data[`${asmName}_${columnKey}`] = asmData[keyDriver];
          if (columnKey === 'accumulatedMonth') {
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

  const refetchStoresOfflineOnlineTotalSales = useCallback(() => {
    const fetchStoresOfflineOnlineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresOfflineOnlineTotalSales(true);      
      const resDay = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      });

      if (!resDay) {
        showErrorReport("Lỗi khi lấy dữ liệu thực đạt Doanh thu đóng hàng Online");
        setIsFetchingStoresOfflineOnlineTotalSales(false);
        return;
      }
      if (resDay.length) {
        const resDayStores = resDay[0].pos_locations;
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resDayStores.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
          });
          return [dataPrev];
        });
      }

      if (moment().date() > 1) {
        const resMonth = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
          from: START_OF_MONTH,
          to: YESTERDAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm,
        });
        if (!resMonth) {
          showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Doanh thu đóng hàng Online");
          setIsFetchingStoresOfflineOnlineTotalSales(false);
          return;
        }
        if (resMonth.length) {
          const resMonthStores = resMonth[0].pos_locations;
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            resMonthStores.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, 'accumulatedMonth');
            });
            return [dataPrev];
          });
        }
      }

      setIsFetchingStoresOfflineOnlineTotalSales(false);
    };
    fetchStoresOfflineOnlineTotalSales();
  }, [dispatch, findKeyDriverAndUpdateValue, selectedAsm, selectedStores, setData]);

  useEffect(() => {
    refetchStoresOfflineOnlineTotalSales();
  }, [refetchStoresOfflineOnlineTotalSales]);

  return { isFetchingStoresOfflineOnlineTotalSales, refetchStoresOfflineOnlineTotalSales };
}

export default useFetchStoresOfflineOnlineTotalSales;
