import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSalesPotential } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresOfflineTotalSalesPotential() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [
    isFetchingStoresOfflineTotalSalesPotential,
    setIsFetchingStoresOfflineTotalSalesPotential,
  ] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback((data: any, asmData: any, columnKey: string) => {
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
        );
      }
    }
  }, []);

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
      ).toFixed(1);
      if (columnKey === "accumulatedMonth") {
        newCustomersConversionRate[`${asmName}_targetMonth`] = (
          (asmData[NewCustomersCount] / asmData[PotentialCustomerCount]) *
          100
        ).toFixed(1);
      }
    }
  }, []);

  const refetchStoresOfflineTotalSalesPotential = useCallback(() => {
    const fetchStoresOfflineTotalSalesPotential = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresOfflineTotalSalesPotential(true);
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineTotalSalesPotential,
        {
          from: TODAY,
          to: TODAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm,
        },
      );
      const monthApi =
        moment().date() > 1
          ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSalesPotential, {
              from: START_OF_MONTH,
              to: YESTERDAY,
              posLocationNames: selectedStores,
              departmentLv2s: selectedAsm,
            })
          : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt khách hàng tiềm năng");
          setIsFetchingStoresOfflineTotalSalesPotential(false);
          return;
        }

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế khách hàng tiềm năng");
          }
          if (resDay.length) {
            const resDayStores = resDay[0].pos_locations;
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
          const resMonthStores = resMonth[0].pos_locations;
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            if (resDay.length) {
              const resDayStores = resDay[0].pos_locations;
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
    fetchStoresOfflineTotalSalesPotential();
  }, [
    calculateConversionRate,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
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
