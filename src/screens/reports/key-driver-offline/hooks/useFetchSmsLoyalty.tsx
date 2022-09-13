import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDSmsLoyalty } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";
import { findKDAndUpdateCallSmsValue } from "../utils/CallSmsKDUtils";

function useFetchSmsLoyalty() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingSmsLoyalty, setIsFetchingSmsLoyalty] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      findKDAndUpdateCallSmsValue({
        data,
        asmData,
        columnKey,
        selectedDate,
        type: "sms",
        dimKey: "department_lv2",
      });
    },
    [selectedDate],
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

  const refetchSmsLoyalty = useCallback(() => {
    const fetchSmsLoyalty = async () => {
      setIsFetchingSmsLoyalty(true);
      const dayApi = callApiNative({ isShowError: true }, dispatch, getKDSmsLoyalty, {
        from: selectedDate,
        to: selectedDate,
        posLocationNames: [],
        departmentLv2s: ASM_LIST,
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ isShowError: true }, dispatch, getKDSmsLoyalty, {
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
                posLocationNames: [],
                departmentLv2s: ASM_LIST,
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ isShowError: true }, dispatch, getKDSmsLoyalty, {
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          posLocationNames: [],
          departmentLv2s: ASM_LIST,
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt SMS theo hạng khách hàng");
          setIsFetchingSmsLoyalty(false);
          return;
        }
        const companyDayData = calculateCompanyKeyDriver(resDay);

        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế SMS theo hạng khách hàng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [companyDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingSmsLoyalty(false);
          return;
        }
        const companyMonthData = calculateCompanyKeyDriver(resMonth);

        setData((prev: any) => {
          let dataPrev: any = prev[0];
          [companyDayData, ...resDay].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
          });
          [companyMonthData, ...resMonth].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });

      setIsFetchingSmsLoyalty(false);
    };
    if (selectedDate) {
      fetchSmsLoyalty();
    }
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, selectedDate, setData]);

  useEffect(() => {
    refetchSmsLoyalty();
  }, [refetchSmsLoyalty]);

  return {
    isFetchingSmsLoyalty,
    refetchSmsLoyalty,
  };
}

export default useFetchSmsLoyalty;