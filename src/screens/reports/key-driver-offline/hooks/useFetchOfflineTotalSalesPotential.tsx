import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSalesPotential } from "service/report/key-driver.service";
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

function useFetchOfflineTotalSalesPotential() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingOfflineTotalSalesPotential, setIsFetchingOfflineTotalSalesPotential] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let potentialCustomerCount: any = [];
      const { PotentialCustomerCount } = KeyDriverField;
      findKeyDriver(data, PotentialCustomerCount, potentialCustomerCount);
      potentialCustomerCount = potentialCustomerCount[0];
      const asmName = nonAccentVietnameseKD(asmData["department_lv2_name"]);
      if (asmName) {
        potentialCustomerCount[`${asmName}_${columnKey}`] = asmData[PotentialCustomerCount];
        if (columnKey === "accumulatedMonth") {
          potentialCustomerCount[`${asmName}_targetMonth`] = calculateTargetMonth(
            potentialCustomerCount[`${asmName}_accumulatedMonth`],
            selectedDate,
          );
        }
      }
    },
    [selectedDate],
  );

  const calculateConversionRate = useCallback((data: any, asmData: any, columnKey: string) => {
    let newCustomersConversionRate: any = [];
    const { NewCustomersConversionRate, PotentialCustomerCount, NewCustomersCount } =
      KeyDriverField;
    findKeyDriver(data, NewCustomersConversionRate, newCustomersConversionRate);
    newCustomersConversionRate = newCustomersConversionRate[0];
    const asmName = nonAccentVietnameseKD(asmData["department_lv2_name"]);
    if (asmName) {
      newCustomersConversionRate[`${asmName}_${columnKey}`] = asmData[PotentialCustomerCount]
        ? ((asmData[NewCustomersCount] / asmData[PotentialCustomerCount]) * 100).toFixed(2)
        : "";
      if (columnKey === "accumulatedMonth") {
        newCustomersConversionRate[`${asmName}_targetMonth`] = asmData[PotentialCustomerCount]
          ? ((asmData[NewCustomersCount] / asmData[PotentialCustomerCount]) * 100).toFixed(2)
          : "";
      }
    }
  }, []);

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = { department_lv2_name: "COMPANY" };
    response.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        companyData[key] = companyData[key] || 0;
        if (!["department_lv2_name"].includes(key)) {
          companyData[key] += ASM_LIST.includes(item.department_lv2_name) ? item[key] : 0;
        }
      });
    });
    return companyData;
  }, []);

  const refetchOfflineTotalSalesPotential = useCallback(() => {
    const fetchOfflineTotalSalesPotential = async () => {
      setIsFetchingOfflineTotalSalesPotential(true);
      const dayApi = callApiNative(
        { isShowError: true },
        dispatch,
        getKDOfflineTotalSalesPotential,
        {
          from: selectedDate,
          to: selectedDate,
          posLocationNames: [],
          departmentLv2s: [],
        },
      );
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ isShowError: true }, dispatch, getKDOfflineTotalSalesPotential, {
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
                posLocationNames: [],
                departmentLv2s: [],
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ isShowError: true }, dispatch, getKDOfflineTotalSalesPotential, {
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          posLocationNames: [],
          departmentLv2s: [],
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt khách hàng tiềm năng");
          setIsFetchingOfflineTotalSalesPotential(false);
          return;
        }
        const companyDayData = calculateCompanyKeyDriver(resDay);

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế khách hàng tiềm năng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [companyDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              calculateConversionRate(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingOfflineTotalSalesPotential(false);
          return;
        }
        const companyMonthData = calculateCompanyKeyDriver(resMonth);

        setData((prev: any) => {
          let dataPrev: any = prev[0];
          [companyDayData, ...resDay].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            calculateConversionRate(dataPrev, item, "actualDay");
          });
          [companyMonthData, ...resMonth].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            calculateConversionRate(dataPrev, item, "accumulatedMonth");
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });

      setIsFetchingOfflineTotalSalesPotential(false);
    };
    if (selectedDate) {
      fetchOfflineTotalSalesPotential();
    }
  }, [
    calculateCompanyKeyDriver,
    calculateConversionRate,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedDate,
    setData,
  ]);

  useEffect(() => {
    refetchOfflineTotalSalesPotential();
  }, [refetchOfflineTotalSalesPotential]);

  return {
    isFetchingOfflineTotalSalesPotential,
    refetchOfflineTotalSalesPotential,
  };
}

export default useFetchOfflineTotalSalesPotential;
