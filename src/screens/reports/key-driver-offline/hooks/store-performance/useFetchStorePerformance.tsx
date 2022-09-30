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
import { getKDOfflineStorePerformance } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../../provider/kd-offline-provider";
import { calculateDimSummary } from "../../utils/DimSummaryUtils";

function useFetchStorePerformance(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineContext);

  const [isFetchingStorePerformance, setIsFetchingStorePerformance] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (dataState: any, dimData: any, columnKey: string) => {
      const { Asm, Store, Staff } = KeyDriverDimension;
      let dimensionKey = "";
      switch (dimension) {
        case Asm:
          dimensionKey = "department_lv2";
          break;
        case Store:
          dimensionKey = "pos_location_name";
          break;
        case Staff:
          dimensionKey = "staff_code";
          break;
        default:
          break;
      }
      const dimensionName = nonAccentVietnameseKD(dimData[dimensionKey]);
      dataState.forEach((dataItem: any) => {
        if (Object.keys(dimData).includes(dataItem.key)) {
          dataItem[`${dimensionName}_${columnKey}`] = dimData[dataItem.key];
          if (
            columnKey === "accumulatedMonth" &&
            ![KeyDriverField.AverageOrderValue, KeyDriverField.AverageCustomerSpent].includes(
              dataItem.key,
            )
          ) {
            dataItem[`${dimensionName}_targetMonth`] = calculateTargetMonth(
              dataItem[`${dimensionName}_accumulatedMonth`],
              selectedDate,
            );
          }
        }
      });
    },
    [dimension, selectedDate],
  );

  const refetchStorePerformance = useCallback(() => {
    const fetchStorePerformance = async () => {
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }

      if (
        dimension === Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        setIsFetchingStorePerformance(false);
        return;
      }
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
      if (dimension === Staff) {
        params = { ...params, staffCodes: selectedStaffs.map((item) => JSON.parse(item).code) };
      }
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineStorePerformance,
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
            ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineStorePerformance, {
                ...params,
                from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
                to: moment(selectedDate, YYYYMMDD).subtract(1, "days").format(YYYYMMDD),
              })
            : Promise.resolve(0);
      } else {
        monthApi = callApiNative(
          { notifyAction: "SHOW_ALL" },
          dispatch,
          getKDOfflineStorePerformance,
          {
            ...params,
            from: moment(selectedDate, YYYYMMDD).startOf("month").format(YYYYMMDD),
            to: moment(selectedDate, YYYYMMDD).format(YYYYMMDD),
          },
        );
      }

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Hiệu suất cửa hàng");
          setIsFetchingStorePerformance(false);
          return;
        }
        const dimName = dimension === Staff ? selectedStores[0] : "";
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            resDayDim = resDay.map((item: any) => {
              if (!item.department_lv2) {
                item.department_lv2 = "Company";
              }
              return item;
            });
          } else {
            resDayDim = calculateDimSummary(resDay[0], dimension, dimName);
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Hiệu suất cửa hàng");
          }

          if (resDay.length) {
            setData((dataPrev: any) => {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
              return [...dataPrev];
            });
          }
          setIsFetchingStorePerformance(false);
          return;
        }

        if (resMonth.length) {
          setData((dataPrev: any) => {
            if (resDay.length) {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
            }
            let resMonthDim: any[] = [];
            if (dimension === Asm) {
              resMonthDim = resMonth.map((item: any) => {
                if (!item.department_lv2) {
                  item.department_lv2 = "Company";
                }
                return item;
              });
            } else {
              resMonthDim = calculateDimSummary(resMonth[0], dimension, dimName);
            }
            resMonthDim.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
            });
            return [...dataPrev];
          });
        }
      });
      setIsFetchingStorePerformance(false);
    };
    if (selectedDate) {
      fetchStorePerformance();
    }
  }, [
    selectedDate,
    dimension,
    selectedStores,
    selectedAsm,
    selectedStaffs,
    dispatch,
    setData,
    findKeyDriverAndUpdateValue,
  ]);

  useEffect(() => {
    refetchStorePerformance();
  }, [refetchStorePerformance]);

  return {
    isFetchingStorePerformance,
    refetchStorePerformance,
  };
}

export default useFetchStorePerformance;
