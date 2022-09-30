import { TODAY } from "config/dashboard";
import {
  ASM_LIST,
  KDOfflineTotalSalesParams,
  KeyDriverDimension,
  KeyDriverField,
} from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSalesPotential } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { kdNumber } from "../constant/kd-offline-template";
import { KDOfflineContext } from "../provider/kd-offline-provider";
import { calculateDimSummary } from "../utils/DimSummaryUtils";

function useFetchOfflineTotalSalesPotential(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedDate, data } = useContext(KDOfflineContext);

  const [isFetchingOfflineTotalSalesPotential, setIsFetchingOfflineTotalSalesPotential] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      data.forEach((dataItem: any) => {
        const { PotentialCustomerCount } = KeyDriverField;
        if (dataItem.key === PotentialCustomerCount) {
          const { Asm, Store, Staff } = KeyDriverDimension;
          let dimensionKey: "department_lv2_name" | "store_name" | "staff_code" | "" = "";
          switch (dimension) {
            case Asm:
              dimensionKey = "department_lv2_name";
              break;
            case Store:
              dimensionKey = "store_name";
              break;
            case Staff:
              dimensionKey = "staff_code";
              break;
            default:
              break;
          }
          const asmName = nonAccentVietnameseKD(asmData[dimensionKey]);
          if (asmName) {
            dataItem[`${asmName}_${columnKey}`] = asmData[PotentialCustomerCount];
            if (columnKey === "accumulatedMonth") {
              dataItem[`${asmName}_targetMonth`] = calculateTargetMonth(
                dataItem[`${asmName}_accumulatedMonth`],
                selectedDate,
              );
            }
          }
        }
      });
    },
    [dimension, selectedDate],
  );

  const calculateConversionRate = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      const { NewCustomersConversionRate, PotentialCustomerCount, NewCustomersCount } =
        KeyDriverField;
      data.forEach((dataItem: any) => {
        if (dataItem.key === PotentialCustomerCount) {
          const newCustomersConversionRate = data.find(
            (item: any) => item.key === NewCustomersConversionRate,
          );
          const { Asm, Store } = KeyDriverDimension;
          let dimKey: "department_lv2_name" | "store_name" | "" = "";
          if (dimension === Asm) {
            dimKey = "department_lv2_name";
          } else if (dimension === Store) {
            dimKey = "store_name";
          } else {
            dimKey = "";
          }
          const asmName = nonAccentVietnameseKD(asmData[dimKey]);
          if (asmName) {
            newCustomersConversionRate[`${asmName}_${columnKey}`] = (
              (asmData[NewCustomersCount] / asmData[PotentialCustomerCount]) *
              100
            ).toFixed(2);
            if (columnKey === "accumulatedMonth") {
              newCustomersConversionRate[`${asmName}_targetMonth`] = (
                (asmData[NewCustomersCount] / asmData[PotentialCustomerCount]) *
                100
              ).toFixed(2);
            }
          }
        }
      });
    },
    [dimension],
  );

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
      if (data.length < kdNumber) {
        return;
      }
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }
      if (dimension === Staff) {
        setIsFetchingOfflineTotalSalesPotential(false);
        return;
      }
      setIsFetchingOfflineTotalSalesPotential(true);
      const params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineTotalSalesPotential,
        {
          ...params,
          from: selectedDate,
          to: selectedDate,
        },
      );
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative(
                { notifyAction: "SHOW_ALL" },
                dispatch,
                getKDOfflineTotalSalesPotential,
                {
                  ...params,
                  from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                  to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
                },
              )
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative(
          { notifyAction: "SHOW_ALL" },
          dispatch,
          getKDOfflineTotalSalesPotential,
          {
            ...params,
            from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
            to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          },
        );
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt khách hàng tiềm năng");
          setIsFetchingOfflineTotalSalesPotential(false);
          return;
        }
        const dimName = "";
        const dimKeys = {
          asmDim: "department_lv2_name",
          storeDim: "store_name",
        };
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            const companyDayData = calculateCompanyKeyDriver(resDay);
            resDayDim = [companyDayData, ...resDay];
          } else {
            resDayDim = calculateDimSummary(resDay[0], dimension, dimName, dimKeys);
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế khách hàng tiềm năng");
          }
          if (resDay.length) {
            setData((dataPrev: any) => {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                calculateConversionRate(dataPrev, item, "actualDay");
              });
              return [...dataPrev];
            });
          }
          setIsFetchingOfflineTotalSalesPotential(false);
          return;
        }

        if (resMonth.length) {
          setData((dataPrev: any) => {
            if (resDay.length) {
              const resDayStores = calculateDimSummary(resDay[0], dimension, dimName, dimKeys);
              resDayStores.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                calculateConversionRate(dataPrev, item, "actualDay");
              });
            }
            let resMonthDim: any[] = [];
            if (dimension === Asm) {
              const companyMonthData = calculateCompanyKeyDriver(resMonth);
              resMonthDim = [companyMonthData, ...resMonth];
            } else {
              resMonthDim = calculateDimSummary(resMonth[0], dimension, dimName, dimKeys);
            }
            resMonthDim.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
              calculateConversionRate(dataPrev, item, "accumulatedMonth");
            });
            return [...dataPrev];
          });
        }
      });

      setIsFetchingOfflineTotalSalesPotential(false);
    };
    if (selectedDate) {
      fetchOfflineTotalSalesPotential();
    }
  }, [
    calculateCompanyKeyDriver,
    calculateConversionRate,
    data.length,
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStores,
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
