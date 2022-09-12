import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCallLoyalty } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";
import { findKDAndUpdateCallSmsValue } from "../utils/CallSmsKDUtils";
import { calculateDimSummary } from "../utils/DimSummaryUtils";

function useFetchStoresCallLoyalty(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedDate, selectedStaffs } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresCallLoyalty, setIsFetchingStoresCallLoyalty] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      findKDAndUpdateCallSmsValue({
        data,
        asmData,
        columnKey,
        selectedDate,
        type: "call",
        dimKey: "pos_location_name",
      });
    },
    [selectedDate],
  );

  const refetchStoresCallLoyalty = useCallback(() => {
    const fetchStoresCallLoyalty = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }

      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresCallLoyalty(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      };
      if (dimension === KeyDriverDimension.Staff) {
        params = { ...params, staffCodes: selectedStaffs.map((item) => JSON.parse(item).code) };
      }
      const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCallLoyalty, {
        ...params,
        from: selectedDate,
        to: selectedDate,
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCallLoyalty, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCallLoyalty, {
          ...params,
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Cuộc gọi theo hạng khách hàng");
          setIsFetchingStoresCallLoyalty(false);
          return;
        }
        const dimName = dimension === KeyDriverDimension.Staff ? selectedStores[0] : "";
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Cuộc gọi theo hạng khách hàng");
          }

          if (resDay.length) {
            const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
            if (resDayStores.length) {
              setData((prev: any) => {
                let dataPrev: any = prev[0];
                resDayStores.forEach((item: any) => {
                  findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                });
                prev[0] = dataPrev;
                return [...prev];
              });
            }
          }
          setIsFetchingStoresCallLoyalty(false);
          return;
        }

        if (resMonth.length) {
          const resMonthStores = calculateDimSummary(resMonth[0], dimension, dimName);
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            if (resDay.length) {
              const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
              resDayStores.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
            }
            resMonthStores.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
        }
      });

      setIsFetchingStoresCallLoyalty(false);
    };
    if (selectedDate) {
      fetchStoresCallLoyalty();
    }
  }, [
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStaffs,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchStoresCallLoyalty();
  }, [refetchStoresCallLoyalty]);

  return {
    isFetchingStoresCallLoyalty,
    refetchStoresCallLoyalty,
  };
}

export default useFetchStoresCallLoyalty;
