import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension, KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCustomerVisitors } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresCustomerVisitors(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresCustomerVisitors, setIsFetchingStoresCustomerVisitors] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let visitors: any = [];
      findKeyDriver(data, KeyDriverField.Visitors, visitors);
      visitors = visitors[0];
      const dimensionKey =
        KeyDriverDimension.Store === dimension ? "pos_location_name" : "staff_code";
      const dimensionName = nonAccentVietnameseKD(asmData[dimensionKey]);
      if (dimensionName) {
        visitors[`${dimensionName}_${columnKey}`] = asmData.value;
        if (columnKey === "accumulatedMonth") {
          visitors[`${dimensionName}_targetMonth`] = calculateTargetMonth(
            visitors[`${dimensionName}_accumulatedMonth`],
            selectedDate,
          );
        }
      }
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
        dimData.value = dimData.value || 0;
        dimData.value += +item.value || 0;
      });
      return dimData;
    },
    [dimension, selectedAsm, selectedStores],
  );

  const refetchStoresCustomerVisitors = useCallback(() => {
    const fetchStoresCustomerVisitors = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresCustomerVisitors(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      };
      if (dimension === KeyDriverDimension.Staff) {
        params = { ...params, staffCodes: selectedStaffs.map((item) => JSON.parse(item).code) };
      }
      const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCustomerVisitors, {
        ...params,
        from: selectedDate,
        to: selectedDate,
      });
      const { YYYYMMDD } = DATE_FORMAT;
      let monthApi: Promise<any>;
      if (selectedDate === moment().format(YYYYMMDD)) {
        monthApi =
          moment(selectedDate, YYYYMMDD).date() > 1
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCustomerVisitors, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCustomerVisitors, {
          ...params,
          from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
          to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
        });
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Khách vào cửa hàng");
          setIsFetchingStoresCustomerVisitors(false);
          return;
        }
        const dimDayData = calculateDimKeyDriver(resDay);

        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Khách vào cửa hàng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            [dimDayData, ...resDay].forEach((item: any) => {
              findKeyDriverAndUpdateValue(prev[0], item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingStoresCustomerVisitors(false);
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
      setIsFetchingStoresCustomerVisitors(false);
    };
    if (selectedDate) {
      fetchStoresCustomerVisitors();
    }
  }, [
    calculateDimKeyDriver,
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
    refetchStoresCustomerVisitors();
  }, [refetchStoresCustomerVisitors]);

  return { isFetchingStoresCustomerVisitors, refetchStoresCustomerVisitors };
}

export default useFetchStoresCustomerVisitors;
