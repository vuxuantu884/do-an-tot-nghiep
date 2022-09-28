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
import { getKDCustomerVisitors } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../provider/kd-offline-provider";

function useFetchCustomerVisitors(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineContext);

  const [isFetchingCustomerVisitors, setIsFetchingCustomerVisitors] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let visitors: any = [];
      findKeyDriver(data, KeyDriverField.Visitors, visitors);
      visitors = visitors[0];
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

  const calculateCompanyKeyDriver = useCallback((response) => {
    let companyData: any = { department_lv2: "COMPANY" };
    response.forEach((item: any) => {
      Object.keys(item).forEach((key) => {
        companyData[key] = companyData[key] || 0;
        if (!["department_lv2"].includes(key)) {
          companyData[key] += ASM_LIST.includes(item.department_lv2) ? item[key] : 0;
        }
      });
    });
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
        dimData.value = dimData.value || 0;
        dimData.value += +item.value || 0;
      });
      return dimData;
    },
    [dimension, selectedAsm, selectedStores],
  );

  const refetchCustomerVisitors = useCallback(() => {
    const fetchCustomerVisitors = async () => {
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
      setIsFetchingCustomerVisitors(true);
      let params: KDOfflineTotalSalesParams = {
        from: TODAY,
        to: TODAY,
        posLocationNames: dimension === Asm ? [] : selectedStores,
        departmentLv2s: dimension === Asm ? ASM_LIST : selectedAsm,
      };
      if (dimension === Staff) {
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
          setIsFetchingCustomerVisitors(false);
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
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Khách vào cửa hàng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            resDayDim.forEach((item: any) => {
              findKeyDriverAndUpdateValue(prev[0], item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingCustomerVisitors(false);
          return;
        }
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resDayDim.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
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
            findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });
      setIsFetchingCustomerVisitors(false);
    };
    if (selectedDate) {
      fetchCustomerVisitors();
    }
  }, [
    calculateCompanyKeyDriver,
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
    refetchCustomerVisitors();
  }, [refetchCustomerVisitors]);

  return { isFetchingCustomerVisitors, refetchCustomerVisitors };
}

export default useFetchCustomerVisitors;
