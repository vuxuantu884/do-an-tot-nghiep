import { TODAY } from "config/dashboard";
import { KDOfflineTotalSalesParams, KeyDriverDimension, KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineOnlineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresOfflineOnlineTotalSales(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresOfflineOnlineTotalSales, setIsFetchingStoresOfflineOnlineTotalSales] =
    useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let uniformOnlineTotalSales: any = [];
      findKeyDriver(data, KeyDriverField.UniformOnlineTotalSales, uniformOnlineTotalSales);
      uniformOnlineTotalSales = uniformOnlineTotalSales[0];
      const dimensionKey =
        KeyDriverDimension.Store === dimension ? "pos_location_name" : "staff_code";
      const dimensionName = nonAccentVietnameseKD(asmData[dimensionKey]);
      if (dimensionName) {
        uniformOnlineTotalSales[`${dimensionName}_${columnKey}`] =
          asmData[KeyDriverField.UniformOnlineTotalSales];
        if (columnKey === "accumulatedMonth") {
          uniformOnlineTotalSales[`${dimensionName}_targetMonth`] = calculateTargetMonth(
            uniformOnlineTotalSales[`${dimensionName}_accumulatedMonth`],
            selectedDate,
          );
        }
      }
    },
    [dimension, selectedDate],
  );

  const refetchStoresOfflineOnlineTotalSales = useCallback(() => {
    const fetchStoresOfflineOnlineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresOfflineOnlineTotalSales(true);
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
        getKDOfflineOnlineTotalSales,
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
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineOnlineTotalSales, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative(
          { notifyAction: "SHOW_ALL" },
          dispatch,
          getKDOfflineOnlineTotalSales,
          {
            ...params,
            from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
            to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          },
        );
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Doanh thu đóng hàng Online");
          setIsFetchingStoresOfflineOnlineTotalSales(false);
          return;
        }
        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Doanh thu đóng hàng Online");
          }
          if (resDay.length) {
            const resDayStores = resDay[0].pos_locations;
            setData((prev: any) => {
              let dataPrev: any = prev[0];
              resDayStores.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
              prev[0] = dataPrev;
              return [...prev];
            });
          }
          setIsFetchingStoresOfflineOnlineTotalSales(false);
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

      setIsFetchingStoresOfflineOnlineTotalSales(false);
    };
    if (selectedDate) {
      fetchStoresOfflineOnlineTotalSales();
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
    refetchStoresOfflineOnlineTotalSales();
  }, [refetchStoresOfflineOnlineTotalSales]);

  return {
    isFetchingStoresOfflineOnlineTotalSales,
    refetchStoresOfflineOnlineTotalSales,
  };
}

export default useFetchStoresOfflineOnlineTotalSales;
