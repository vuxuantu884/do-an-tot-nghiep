import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSalesLoyalty } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchOfflineTotalSalesLoyalty() {
  const dispatch = useDispatch();
  const { setData } = useContext(KeyDriverOfflineContext);

  const [isFetchingOfflineTotalSalesLoyalty, setIsFetchingOfflineTotalSalesLoyalty] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback((data: any, asmData: any, columnKey: string) => {
    let customersCount: any = [];
    const {
      CustomersCount,
      CustomerLte90DaysTotalSales,
      ShopperLte90DaysTotalSales,
      OthersTotalSales,
    } = KeyDriverField;
    findKeyDriver(data, CustomersCount, customersCount);
    customersCount = customersCount[0];
    const asmName = nonAccentVietnameseKD(asmData["department_lv2"]);
    if (asmName) {
      customersCount[`${asmName}_${columnKey}`] = asmData[CustomersCount];
      if (columnKey === "accumulatedMonth") {
        customersCount[`${asmName}_targetMonth`] = calculateTargetMonth(
          customersCount[`${asmName}_accumulatedMonth`],
        );
      }
    }
    if (customersCount.children?.length) {
      customersCount.children.forEach((item: any) => {
        if (Object.keys(asmData).findIndex((itemKey) => item.key === itemKey) !== -1) {
          item[`${asmName}_${columnKey}`] = asmData[item.key];
          // doanh thu nhóm KH khác = tổng doanh thu các nhóm khách hàng còn lại không show trên BC
          if (item.key === OthersTotalSales) {
            item[`${asmName}_${columnKey}`] =
              asmData[item.key] +
              asmData[CustomerLte90DaysTotalSales] +
              asmData[ShopperLte90DaysTotalSales];
          }
          if (columnKey === "accumulatedMonth") {
            item[`${asmName}_targetMonth`] = calculateTargetMonth(
              item[`${asmName}_accumulatedMonth`],
            );
          }
        }
      });
    }
  }, []);

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

  const refetchOfflineTotalSalesLoyalty = useCallback(() => {
    const fetchOfflineTotalSalesLoyalty = async () => {
      setIsFetchingOfflineTotalSalesLoyalty(true);
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineTotalSalesLoyalty,
        {
          from: TODAY,
          to: TODAY,
          posLocationNames: [],
          departmentLv2s: [],
        },
      );
      const monthApi =
        moment().date() > 1
          ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSalesLoyalty, {
              from: START_OF_MONTH,
              to: YESTERDAY,
              posLocationNames: [],
              departmentLv2s: [],
            })
          : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Tổng khách mua");
          setIsFetchingOfflineTotalSalesLoyalty(false);
          return;
        }
        const companyDayData = calculateCompanyKeyDriver(resDay);

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Tổng khách mua");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [companyDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingOfflineTotalSalesLoyalty(false);
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

      setIsFetchingOfflineTotalSalesLoyalty(false);
    };
    fetchOfflineTotalSalesLoyalty();
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, setData]);

  useEffect(() => {
    refetchOfflineTotalSalesLoyalty();
  }, [refetchOfflineTotalSalesLoyalty]);

  return {
    isFetchingOfflineTotalSalesLoyalty,
    refetchOfflineTotalSalesLoyalty,
  };
}

export default useFetchOfflineTotalSalesLoyalty;
