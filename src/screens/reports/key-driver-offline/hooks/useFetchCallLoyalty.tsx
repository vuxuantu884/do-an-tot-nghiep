import { TODAY } from "config/dashboard";
import { ASM_LIST, KDOfflineTotalSalesParams, KeyDriverDimension } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCallLoyalty } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../provider/kd-offline-provider";
import { findKDAndUpdateCallSmsValue } from "../utils/CallSmsKDUtils";
import { calculateDimSummary } from "../utils/DimSummaryUtils";

function useFetchCallLoyalty(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedDate } = useContext(KDOfflineContext);

  const [isFetchingCallLoyalty, setIsFetchingCallLoyalty] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (dataState: any, dimData: any, columnKey: string) => {
      const { Asm, Store } = KeyDriverDimension;
      let dimKey: "department_lv2" | "pos_location_name" | undefined;
      if (dimension === Asm) {
        dimKey = "department_lv2";
      } else if (dimension === Store) {
        dimKey = "pos_location_name";
      } else {
        dimKey = undefined;
      }
      findKDAndUpdateCallSmsValue({
        dataState,
        dimData,
        columnKey,
        selectedDate,
        type: "call",
        dimKey,
      });
    },
    [dimension, selectedDate],
  );

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = { department_lv2: "COMPANY" };
    response.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        companyData[key] = companyData[key] || 0;
        if (!["department_lv2"].includes(key)) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      });
    });
    return companyData;
  }, []);

  const refetchCallLoyalty = useCallback(() => {
    const fetchCallLoyalty = async () => {
      setIsFetchingCallLoyalty(true);
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }

      if (dimension === Staff) {
        setIsFetchingCallLoyalty(false);
        return;
      }
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
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
          setIsFetchingCallLoyalty(false);
          return;
        }
        const dimName = "";
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            const companyDayData = calculateCompanyKeyDriver(resDay);
            resDayDim = [companyDayData, ...resDay];
          } else {
            resDayDim = calculateDimSummary(resDay[0], dimension, dimName);
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Cuộc gọi theo hạng khách hàng");
          }

          if (resDay.length) {
            setData((dataPrev: any) => {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
              return [...dataPrev];
            });
          }
          setIsFetchingCallLoyalty(false);
          return;
        }

        if (resMonth.length) {
          setData((dataPrev: any) => {
            if (resDay.length) {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
            }
            let resMonthDim: any[] = [];
            if (dimension === Asm) {
              const companyMonthData = calculateCompanyKeyDriver(resMonth);
              resMonthDim = [companyMonthData, ...resMonth];
            } else {
              resMonthDim = calculateDimSummary(resMonth[0], dimension, dimName);
            }
            resMonthDim.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            });
            return [...dataPrev];
          });
        }
      });

      setIsFetchingCallLoyalty(false);
    };
    if (selectedDate) {
      fetchCallLoyalty();
    }
  }, [
    calculateCompanyKeyDriver,
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchCallLoyalty();
  }, [refetchCallLoyalty]);

  return {
    isFetchingCallLoyalty,
    refetchCallLoyalty,
  };
}

export default useFetchCallLoyalty;
