import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineOnlineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, findKeyDriver, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
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
      let uniformOnlineTotalSales: any = [];
      findKeyDriver(data, KeyDriverField.UniformOnlineTotalSales, uniformOnlineTotalSales);
      uniformOnlineTotalSales = uniformOnlineTotalSales[0];
      const asmName = nonAccentVietnameseKD(asmData['department_lv2']);
      if (asmName) {
        uniformOnlineTotalSales[`${asmName}_${columnKey}`] = asmData[KeyDriverField.UniformOnlineTotalSales];
        if (columnKey === 'accumulatedMonth') {
          uniformOnlineTotalSales[`${asmName}_targetMonth`] = calculateTargetMonth(uniformOnlineTotalSales[`${asmName}_accumulatedMonth`]);
        }
      }
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
      const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: [],
        departmentLv2s: [],
      });
      const monthApi = (moment().date() > 1) ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
        from: START_OF_MONTH,
        to: YESTERDAY,
        posLocationNames: [],
        departmentLv2s: [],
      }) : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Tổng khách mua");
          setIsFetchingOfflineOnlineTotalSales(false);
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
              findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingOfflineOnlineTotalSales(false);
          return;
        }
        const companyMonthData = calculateCompanyKeyDriver(resMonth);
  
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          [companyDayData, ...resDay].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
          });
          [companyMonthData, ...resMonth].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'accumulatedMonth');
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });
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
