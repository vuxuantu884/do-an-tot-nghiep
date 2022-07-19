import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineOnlineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnamese } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchOfflineOnlineTotalSales() {
  const dispatch = useDispatch();
  const { setData } = useContext(KeyDriverOfflineContext);

  const [isFetchingOfflineOnlineTotalSales, setIsFetchingOfflineOnlineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver) => {
        const asmName = nonAccentVietnamese(asmData['department_lv2']);
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

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = {department_lv2: 'COMPANY'};
    response.forEach((item: any) => {
      Object.keys(item).forEach(key => {
        companyData[key] = companyData[key] || 0;
        if (!['department_lv2'].includes(key)) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      })
    })
    return companyData;
  }, []);

  const refetchOfflineOnlineTotalSales = useCallback(() => {
    const fetchOfflineOnlineTotalSales = async () => {
      setIsFetchingOfflineOnlineTotalSales(true);      
      const resDay = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: [],
        departmentLv2s: [],
      });

      if (!resDay) {
        showErrorReport("Lỗi khi lấy dữ liệu thực đạt Tổng khách mua");
        setIsFetchingOfflineOnlineTotalSales(false);
        return;
      }
      const companyDayData = calculateCompanyKeyDriver(resDay);

      setData((prev: any) => {
        let dataPrev: any = prev[0];
        [companyDayData, ...resDay].forEach((item: any) => {
          findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
        });
        return [dataPrev];
      });

      if (moment().date() > 1) {
        const resMonth = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
          from: START_OF_MONTH,
          to: YESTERDAY,
          posLocationNames: [],
          departmentLv2s: [],
        });
        if (!resMonth) {
          showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Tổng khách mua");
          setIsFetchingOfflineOnlineTotalSales(false);
          return;
        }
        const companyMonthData = calculateCompanyKeyDriver(resMonth);
  
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          [companyMonthData, ...resMonth].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'accumulatedMonth');
          });
          return [dataPrev];
        });
      }

      setIsFetchingOfflineOnlineTotalSales(false);
    };
    fetchOfflineOnlineTotalSales();
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, setData]);

  useEffect(() => {
    refetchOfflineOnlineTotalSales();
  }, [refetchOfflineOnlineTotalSales]);

  return { isFetchingOfflineOnlineTotalSales, refetchOfflineOnlineTotalSales };
}

export default useFetchOfflineOnlineTotalSales;
