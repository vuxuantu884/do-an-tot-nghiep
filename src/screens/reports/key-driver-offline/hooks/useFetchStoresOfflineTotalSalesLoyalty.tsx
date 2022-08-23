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
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresOfflineTotalSalesLoyalty() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresOfflineTotalSalesLoyalty, setIsFetchingStoresOfflineTotalSalesLoyalty] =
    useState<boolean | undefined>();

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
    const asmName = nonAccentVietnameseKD(asmData["pos_location_name"]);
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

  const refetchStoresOfflineTotalSalesLoyalty = useCallback(() => {
    const fetchStoresOfflineTotalSalesLoyalty = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresOfflineTotalSalesLoyalty(true);
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineTotalSalesLoyalty,
        {
          from: TODAY,
          to: TODAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm,
        },
      );
      const monthApi =
        moment().date() > 1
          ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSalesLoyalty, {
              from: START_OF_MONTH,
              to: YESTERDAY,
              posLocationNames: selectedStores,
              departmentLv2s: selectedAsm,
            })
          : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Tổng khách mua");
          setIsFetchingStoresOfflineTotalSalesLoyalty(false);
          return;
        }

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Tổng khách mua");
          }
          if (resDay.length) {
            const resDayStores = resDay[0].pos_locations;
            if (resDayStores.length) {
              setData((prev: any) => {
                let dataPrev: any = prev[0];
                resDayStores.forEach((item: any) => {
                  findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
                });
                prev[0] = dataPrev;
                return [...prev];
              });
            }
          }
          setIsFetchingStoresOfflineTotalSalesLoyalty(false);
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
              });
            }
            resMonthStores.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
        }
      });

      setIsFetchingStoresOfflineTotalSalesLoyalty(false);
    };
    fetchStoresOfflineTotalSalesLoyalty();
  }, [dispatch, findKeyDriverAndUpdateValue, selectedAsm, selectedStores, setData]);

  useEffect(() => {
    refetchStoresOfflineTotalSalesLoyalty();
  }, [refetchStoresOfflineTotalSalesLoyalty]);

  return {
    isFetchingStoresOfflineTotalSalesLoyalty,
    refetchStoresOfflineTotalSalesLoyalty,
  };
}

export default useFetchStoresOfflineTotalSalesLoyalty;
