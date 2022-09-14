import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension, KeyDriverField } from "model/report";
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
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";
import { calculateDimSummary } from "../utils/DimSummaryUtils";

function useFetchStoresOfflineTotalSalesPotential(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedDate } = useContext(KDOfflineStoresContext);

  const [
    isFetchingStoresOfflineTotalSalesPotential,
    setIsFetchingStoresOfflineTotalSalesPotential,
  ] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let potentialCustomerCount: any = [];
      const { PotentialCustomerCount } = KeyDriverField;
      findKeyDriver(data, PotentialCustomerCount, potentialCustomerCount);
      potentialCustomerCount = potentialCustomerCount[0];
      const asmName = nonAccentVietnameseKD(asmData["store_name"]);
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
    const asmName = nonAccentVietnameseKD(asmData["store_name"]);
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
  }, []);

  const refetchStoresOfflineTotalSalesPotential = useCallback(() => {
    const fetchStoresOfflineTotalSalesPotential = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (dimension === KeyDriverDimension.Staff) {
        setIsFetchingStoresOfflineTotalSalesPotential(false);
        return;
      }
      setIsFetchingStoresOfflineTotalSalesPotential(true);
      const params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
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
          setIsFetchingStoresOfflineTotalSalesPotential(false);
          return;
        }
        const dimName = "";
        const dimKeys = {
          asmDim: "department_lv2_name",
          storeDim: "store_name",
        };
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế khách hàng tiềm năng");
          }
          if (resDay.length) {
            const resDayStores = calculateDimSummary(resDay[0], dimension, dimName, dimKeys);
            if (resDayStores.length) {
              setData((prev: any) => {
                let dataPrev: any = prev[0];
                resDayStores.forEach((item: any) => {
                  findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                  calculateConversionRate(dataPrev, item, "actualDay");
                });
                prev[0] = dataPrev;
                return [...prev];
              });
            }
          }
          setIsFetchingStoresOfflineTotalSalesPotential(false);
          return;
        }

        if (resMonth.length) {
          const resMonthStores = calculateDimSummary(resMonth[0], dimension, dimName, dimKeys);
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            if (resDay.length) {
              const resDayStores = calculateDimSummary(resDay[0], dimension, dimName, dimKeys);
              resDayStores.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                calculateConversionRate(dataPrev, item, "actualDay");
              });
            }
            resMonthStores.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
              calculateConversionRate(dataPrev, item, "accumulatedMonth");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
        }
      });

      setIsFetchingStoresOfflineTotalSalesPotential(false);
    };
    if (selectedDate) {
      fetchStoresOfflineTotalSalesPotential();
    }
  }, [
    calculateConversionRate,
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchStoresOfflineTotalSalesPotential();
  }, [refetchStoresOfflineTotalSalesPotential]);

  return {
    isFetchingStoresOfflineTotalSalesPotential,
    refetchStoresOfflineTotalSalesPotential,
  };
}

export default useFetchStoresOfflineTotalSalesPotential;
