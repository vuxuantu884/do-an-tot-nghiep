import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchKDOfflineTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingKDOfflineTotalSales, setIsFetchingKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver) => {
        const asmName = nonAccentVietnameseKD(asmData["department_lv2"]);
        if (data.key === keyDriver && asmName) {
          data[`${asmName}_${columnKey}`] = asmData[keyDriver];
          if (
            columnKey === "accumulatedMonth" &&
            !["average_order_value", "average_customer_spent"].includes(keyDriver)
          ) {
            data[`${asmName}_targetMonth`] = calculateTargetMonth(
              data[`${asmName}_accumulatedMonth`],
              selectedDate,
            );
          }
        } else {
          if (
            data.children?.length &&
            [KeyDriverField.TotalSales, KeyDriverField.OfflineTotalSales].includes(data.key)
          ) {
            data.children.forEach((item: any) => {
              findKeyDriverAndUpdateValue(item, asmData, columnKey);
            });
          }
        }
      });
    },
    [selectedDate],
  );

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = { department_lv2: "COMPANY" };
    response.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        companyData[key] = companyData[key] || 0;
        if (
          !["department_lv2", "month", "average_order_value", "average_customer_spent"].includes(
            key,
          )
        ) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      });
    });
    companyData.average_order_value = companyData.offline_total_orders
      ? Math.round(companyData.offline_total_sales / companyData.offline_total_orders)
      : 0;

    return companyData;
  }, []);

  const refetchKDOfflineTotalSales = useCallback(() => {
    const fetchKDOfflineTotalSales = async () => {
      setIsFetchingKDOfflineTotalSales(true);
      const dayApi = callApiNative({ isShowError: true }, dispatch, getKDOfflineTotalSales, {
        from: selectedDate,
        to: selectedDate,
        posLocationNames: [""],
        departmentLv2s: [""],
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ isShowError: true }, dispatch, getKDOfflineTotalSales, {
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
                posLocationNames: [""],
                departmentLv2s: [""],
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ isShowError: true }, dispatch, getKDOfflineTotalSales, {
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          posLocationNames: [""],
          departmentLv2s: [""],
        });
      }
      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt doanh thu offline");
          setIsFetchingKDOfflineTotalSales(false);
          return;
        }
        const companyDayData = calculateCompanyKeyDriver(resDay);
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [companyDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingKDOfflineTotalSales(false);
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

      setIsFetchingKDOfflineTotalSales(false);
    };
    if (selectedDate) {
      fetchKDOfflineTotalSales();
    }
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, selectedDate, setData]);

  useEffect(() => {
    refetchKDOfflineTotalSales();
  }, [refetchKDOfflineTotalSales]);

  return { isFetchingKDOfflineTotalSales, refetchKDOfflineTotalSales };
}

export default useFetchKDOfflineTotalSales;
