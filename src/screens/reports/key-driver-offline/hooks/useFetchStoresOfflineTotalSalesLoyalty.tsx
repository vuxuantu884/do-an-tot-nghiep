import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension, KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSalesLoyalty } from "service/report/key-driver.service";
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

function useFetchStoresOfflineTotalSalesLoyalty(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresOfflineTotalSalesLoyalty, setIsFetchingStoresOfflineTotalSalesLoyalty] =
    useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let customersCount: any = [];
      const {
        CustomersCount,
        CustomerLte90DaysTotalSales,
        ShopperLte90DaysTotalSales,
        OthersTotalSales,
      } = KeyDriverField;
      findKeyDriver(data, CustomersCount, customersCount);
      customersCount = customersCount[0];
      const dimensionKey =
        KeyDriverDimension.Store === dimension ? "pos_location_name" : "staff_code";
      const dimensionName = nonAccentVietnameseKD(asmData[dimensionKey]);
      if (dimensionName) {
        customersCount[`${dimensionName}_${columnKey}`] = asmData[CustomersCount];
        if (columnKey === "accumulatedMonth") {
          customersCount[`${dimensionName}_targetMonth`] = calculateTargetMonth(
            customersCount[`${dimensionName}_accumulatedMonth`],
            selectedDate,
          );
        }
      }
      if (customersCount.children?.length) {
        customersCount.children.forEach((item: any) => {
          if (Object.keys(asmData).findIndex((itemKey) => item.key === itemKey) !== -1) {
            item[`${dimensionName}_${columnKey}`] = asmData[item.key];
            // doanh thu nhóm KH khác = tổng doanh thu các nhóm khách hàng còn lại không show trên BC
            if (item.key === OthersTotalSales) {
              item[`${dimensionName}_${columnKey}`] =
                asmData[item.key] +
                asmData[CustomerLte90DaysTotalSales] +
                asmData[ShopperLte90DaysTotalSales];
            }
            if (columnKey === "accumulatedMonth") {
              item[`${dimensionName}_targetMonth`] = calculateTargetMonth(
                item[`${dimensionName}_accumulatedMonth`],
                selectedDate,
              );
            }
          }
        });
      }
    },
    [dimension, selectedDate],
  );

  const refetchStoresOfflineTotalSalesLoyalty = useCallback(() => {
    const fetchStoresOfflineTotalSalesLoyalty = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresOfflineTotalSalesLoyalty(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      };
      if (dimension === KeyDriverDimension.Staff) {
        params = { ...params, staffCodes: selectedStaffs.map((item) => JSON.parse(item).code) };
      }
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineTotalSalesLoyalty,
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
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSalesLoyalty, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative(
          { notifyAction: "SHOW_ALL" },
          dispatch,
          getKDOfflineTotalSalesLoyalty,
          {
            ...params,
            from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
            to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          },
        );
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Tổng khách mua");
          setIsFetchingStoresOfflineTotalSalesLoyalty(false);
          return;
        }
        const dimName = dimension === KeyDriverDimension.Staff ? selectedStores[0] : "";
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Tổng khách mua");
          }
          if (resDay.length) {
            const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
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
          const resMonthStores = calculateDimSummary(resMonth[0], dimension, dimName);
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            if (resDay.length) {
              const resDayStores = calculateDimSummary(resDay[0], dimension, dimName);
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
    if (selectedDate) {
      fetchStoresOfflineTotalSalesLoyalty();
    }
  }, [
    dimension,
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedDate,
    selectedStaffs,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchStoresOfflineTotalSalesLoyalty();
  }, [refetchStoresOfflineTotalSalesLoyalty]);

  return {
    isFetchingStoresOfflineTotalSalesLoyalty,
    refetchStoresOfflineTotalSalesLoyalty,
  };
}

export default useFetchStoresOfflineTotalSalesLoyalty;
