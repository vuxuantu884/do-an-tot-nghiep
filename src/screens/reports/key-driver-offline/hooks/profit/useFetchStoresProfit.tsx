import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineProfit } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../../provider/kd-offline-stores-provider";
import { calculateDimSummary } from "../../utils/DimSummaryUtils";
import { findKDAndUpdateProfitKD } from "../../utils/ProfitKDUtils";

function useFetchStoresProfit(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedDate, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresProfit, setIsFetchingStoresProfit] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, dimData: any, columnKey: string, keyDriver: string) => {
      findKDAndUpdateProfitKD({
        data,
        dimData,
        columnKey,
        selectedDate,
        dimKey: "pos_location_name",
        keyDriver,
      });
    },
    [selectedDate],
  );

  const refetchProfit = useCallback(() => {
    const fetchProfit = async () => {
      setIsFetchingStoresProfit(true);
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (dimension === KeyDriverDimension.Staff) {
        setIsFetchingStoresProfit(false);
        return;
      }
      const params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      };
      const dayApi = callApiNative({ isShowError: true }, dispatch, getKDOfflineProfit, {
        ...params,
        from: selectedDate,
        to: selectedDate,
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ isShowError: true }, dispatch, getKDOfflineProfit, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ isShowError: true }, dispatch, getKDOfflineProfit, {
          ...params,
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Cuộc gọi theo hạng khách hàng");
          setIsFetchingStoresProfit(false);
          return;
        }
        const dimName = "";
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Cuộc gọi theo hạng khách hàng");
          }
          if (resDay.length) {
            setData((prev: any) => {
              let dataPrev: any = prev[2];
              const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
              resDayStores.forEach((item: any) => {
                Object.keys(item).forEach((keyDriver) => {
                  findKeyDriverAndUpdateValue(dataPrev, item, "actualDay", keyDriver);
                });
              });
              prev[2] = dataPrev;
              return [...prev];
            });
          }
          setIsFetchingStoresProfit(false);
          return;
        }
        setData((prev: any) => {
          let dataPrev: any = prev[2];
          if (resDay.length) {
            const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
            resDayStores.forEach((item: any) => {
              Object.keys(item).forEach((keyDriver) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay", keyDriver);
              });
            });
          }
          const resMonthStores = calculateDimSummary(resMonth[0], dimension, dimName);
          resMonthStores.forEach((item: any) => {
            Object.keys(item).forEach((keyDriver) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth", keyDriver);
            });
          });
          prev[2] = dataPrev;
          return [...prev];
        });
      });

      setIsFetchingStoresProfit(false);
    };
    if (selectedDate) {
      fetchProfit();
    }
  }, [
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchProfit();
  }, [refetchProfit]);

  return {
    isFetchingStoresProfit,
    refetchProfit,
  };
}

export default useFetchStoresProfit;
