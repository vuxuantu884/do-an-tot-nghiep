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
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../provider/kd-offline-provider";

function useFetchKDOfflineTotalSales(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineContext);

  const [isFetchingKDOfflineTotalSales, setIsFetchingKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string, keyDriver: any) => {
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
            findKeyDriverAndUpdateValue(item, asmData, columnKey, keyDriver);
          });
        }
      }
    },
    [dimension, selectedDate],
  );

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = { department_lv2: "COMPANY" };
    response.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        companyData[key] = companyData[key] || 0;
        if (
          !["department_lv2", "month", "average_order_value", "average_customer_spent"].includes(
            key,
          )
        ) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      });
    });
    companyData.average_order_value = companyData.offline_total_orders
      ? Math.round(companyData.offline_total_sales / companyData.offline_total_orders)
      : 0;

    return companyData;
  }, []);

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
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }
      if (
        dimension === Staff &&
        (!selectedStores.length || !selectedAsm.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingKDOfflineTotalSales(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
      if (dimension === Staff) {
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
          setIsFetchingKDOfflineTotalSales(false);
          return;
        }
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            const companyDayData = calculateCompanyKeyDriver(resDay);
            resDayDim = [companyDayData, ...resDay];
          } else {
            const dimDayData = calculateDimKeyDriver(resDay);
            resDayDim = [dimDayData, ...resDay];
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            resDayDim.forEach((item: any) => {
              Object.keys(item).forEach((keyDriver: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay", keyDriver);
              });
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingKDOfflineTotalSales(false);
          return;
        }
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resDayDim.forEach((item: any) => {
            Object.keys(item).forEach((keyDriver: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay", keyDriver);
            });
          });
          let resMonthDim: any[] = [];
          if (dimension === Asm) {
            const companyMonthData = calculateCompanyKeyDriver(resMonth);
            resMonthDim = [companyMonthData, ...resMonth];
          } else {
            const dimMonthData = calculateDimKeyDriver(resMonth);
            resMonthDim = [dimMonthData, ...resMonth];
          }
          resMonthDim.forEach((item: any) => {
            Object.keys(item).forEach((keyDriver: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth", keyDriver);
            });
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });
      setIsFetchingKDOfflineTotalSales(false);
    };
    if (selectedDate) {
      fetchStoresKDOfflineTotalSales();
    }
  }, [
    selectedDate,
    dimension,
    selectedStores,
    selectedAsm,
    selectedStaffs,
    dispatch,
    calculateDimKeyDriver,
    setData,
    calculateCompanyKeyDriver,
    findKeyDriverAndUpdateValue,
  ]);

  useEffect(() => {
    refetchStoresKDOfflineTotalSales();
  }, [refetchStoresKDOfflineTotalSales]);

  return {
    isFetchingKDOfflineTotalSales,
    refetchStoresKDOfflineTotalSales,
  };
}

export default useFetchKDOfflineTotalSales;
