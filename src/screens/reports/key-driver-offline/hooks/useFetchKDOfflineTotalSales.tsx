import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnamese } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchKDOfflineTotalSales() {
  const dispatch = useDispatch();
  const { setData } = useContext(KeyDriverOfflineContext);

  const [isFetchingKDOfflineTotalSales, setIsFetchingKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver) => {
        const asmName = nonAccentVietnamese(asmData['department_lv2']);
        if (data.key === keyDriver && asmName) {
          data[`${asmName}_${columnKey}`] = asmData[keyDriver];
          if (columnKey === 'accumulatedMonth' && !['average_order_value', 'average_customer_spent'].includes(keyDriver)) {
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
        if (!['department_lv2', 'month', 'average_order_value', 'average_customer_spent'].includes(key)) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      })
    });
    companyData.average_order_value = companyData.total_orders ? Math.round(companyData.offline_total_sales / companyData.total_orders) : 0;
    
    return companyData;
  }, []);

  const refetchKDOfflineTotalSales = useCallback(() => {
    const fetchKDOfflineTotalSales = async () => {
      setIsFetchingKDOfflineTotalSales(true);      
      const resDay = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: [''],
        departmentLv2s: ['']
      });

      if (!resDay) {
        showErrorReport("Lỗi khi lấy dữ liệu thực đạt doanh thu offline");
        setIsFetchingKDOfflineTotalSales(false);
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
        const resMonth = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
          from: START_OF_MONTH,
          to: YESTERDAY,
          posLocationNames: [''],
          departmentLv2s: ['']
        });
        if (!resMonth) {
          showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          setIsFetchingKDOfflineTotalSales(false);
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

      setIsFetchingKDOfflineTotalSales(false);
    };
    fetchKDOfflineTotalSales();
  }, [calculateCompanyKeyDriver, dispatch, findKeyDriverAndUpdateValue, setData]);

  useEffect(() => {
    refetchKDOfflineTotalSales();
  }, [refetchKDOfflineTotalSales]);

  return { isFetchingKDOfflineTotalSales, refetchKDOfflineTotalSales };
}

export default useFetchKDOfflineTotalSales;
