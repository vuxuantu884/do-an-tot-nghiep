import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCustomerVisitors } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchCustomerVisitors() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingCustomerVisitors, setIsFetchingCustomerVisitors] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let visitors: any = [];
      findKeyDriver(data, KeyDriverField.Visitors, visitors);
      visitors = visitors[0];
      const asmName = nonAccentVietnameseKD(asmData["department_lv2"]);
      if (asmName) {
        visitors[`${asmName}_${columnKey}`] = asmData.value;
        if (columnKey === "accumulatedMonth") {
          visitors[`${asmName}_targetMonth`] = calculateTargetMonth(
            visitors[`${asmName}_accumulatedMonth`],
            selectedDate,
          );
        }
      }
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

  const refetchCustomerVisitors = useCallback(() => {
    const fetchCustomerVisitors = async () => {
      setIsFetchingCustomerVisitors(true);
      const dayApi = callApiNative({ isShowError: true }, dispatch, getKDCustomerVisitors, {
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
            ? callApiNative({ isShowError: true }, dispatch, getKDCustomerVisitors, {
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
                posLocationNames: [],
                departmentLv2s: ASM_LIST,
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ isShowError: true }, dispatch, getKDCustomerVisitors, {
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          posLocationNames: [],
          departmentLv2s: ASM_LIST,
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Khách vào cửa hàng");
          setIsFetchingCustomerVisitors(false);
          return;
        }
        const companyDayData = calculateCompanyKeyDriver(resDay);

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Khách vào cửa hàng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [companyDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingCustomerVisitors(false);
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

      setIsFetchingCustomerVisitors(false);
    };
    if (selectedDate) {
      fetchCustomerVisitors();
    }
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, selectedDate, setData]);

  useEffect(() => {
    refetchCustomerVisitors();
  }, [refetchCustomerVisitors]);

  return { isFetchingCustomerVisitors, refetchCustomerVisitors };
}

export default useFetchCustomerVisitors;
