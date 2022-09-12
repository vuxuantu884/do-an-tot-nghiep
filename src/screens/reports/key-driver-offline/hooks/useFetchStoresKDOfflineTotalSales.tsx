import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension, KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresKDOfflineTotalSales(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresKDOfflineTotalSales, setIsFetchingStoresKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      Object.keys(asmData).forEach((keyDriver: any) => {
        const dimensionKey =
          KeyDriverDimension.Store === dimension ? "pos_location_name" : "staff_code";
        const dimensionName = nonAccentVietnameseKD(asmData[dimensionKey]);
        if (data.key === keyDriver && dimensionName) {
          data[`${dimensionName}_${columnKey}`] = asmData[keyDriver];
          if (
            columnKey === "accumulatedMonth" &&
            ![KeyDriverField.AverageOrderValue, KeyDriverField.AverageCustomerSpent].includes(
              keyDriver,
            )
          ) {
            data[`${dimensionName}_targetMonth`] = calculateTargetMonth(
              data[`${dimensionName}_accumulatedMonth`],
              selectedDate,
            );
          }
        } else {
          if (
            data.children?.length &&
            [KeyDriverField.TotalSales, KeyDriverField.OfflineTotalSales].includes(data.key)
          ) {
            data.children.forEach((item: any) => {
              findKeyDriverAndUpdateValue(item, asmData, columnKey);
            });
          }
        }
      });
    },
    [dimension, selectedDate],
  );

  const calculateDimKeyDriver = useCallback(
    (response) => {
      let dimData: any = {};
      dimData = {
        department_lv2: selectedAsm[0],
        pos_location_name: selectedAsm[0],
      };
      if (dimension === KeyDriverDimension.Staff) {
        dimData = {
          ...dimData,
          staff_name: selectedStores[0],
          staff_code: nonAccentVietnameseKD(selectedStores[0]),
        };
      }
      response.forEach((item: any) => {
        Object.keys(item).forEach((key) => {
          dimData[key] = dimData[key] || 0;
          if (
            ![
              "department_lv2",
              "month",
              "average_order_value",
              "average_customer_spent",
              "pos_location_name",
              "staff_name",
              "staff_code",
            ].includes(key)
          ) {
            dimData[key] += item[key] || 0;
          }
        });
      });
      dimData.average_order_value = dimData.offline_total_orders
        ? Math.round(dimData.offline_total_sales / dimData.offline_total_orders)
        : 0;

      return dimData;
    },
    [dimension, selectedAsm, selectedStores],
  );

  const refetchStoresKDOfflineTotalSales = useCallback(() => {
    const fetchStoresKDOfflineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresKDOfflineTotalSales(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      };
      if (dimension === KeyDriverDimension.Staff) {
        params = {
          ...params,
          staffCodes: selectedStaffs.map((item) => JSON.parse(item).code.toLocaleLowerCase()),
        };
      }
      const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
        ...params,
        from: selectedDate,
        to: selectedDate,
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment().date() > 1
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
          ...params,
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt doanh thu offline");
          setIsFetchingStoresKDOfflineTotalSales(false);
          return;
        }
        const dimDayData = calculateDimKeyDriver(resDay);

        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [dimDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingStoresKDOfflineTotalSales(false);
          return;
        }
        const dimMonthData = calculateDimKeyDriver(resMonth);
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          [dimDayData, ...resDay].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
          });
          [dimMonthData, ...resMonth].forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });
      setIsFetchingStoresKDOfflineTotalSales(false);
    };
    if (selectedDate) {
      fetchStoresKDOfflineTotalSales();
    }
  }, [
    selectedDate,
    selectedStores,
    selectedAsm,
    dimension,
    selectedStaffs,
    dispatch,
    calculateDimKeyDriver,
    setData,
    findKeyDriverAndUpdateValue,
  ]);

  useEffect(() => {
    refetchStoresKDOfflineTotalSales();
  }, [refetchStoresKDOfflineTotalSales]);

  return {
    isFetchingStoresKDOfflineTotalSales,
    refetchStoresKDOfflineTotalSales,
  };
}

export default useFetchStoresKDOfflineTotalSales;
