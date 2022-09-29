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
import { getKDOfflineTotalSalesLoyalty } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineContext } from "../provider/kd-offline-provider";
import { calculateDimSummary } from "../utils/DimSummaryUtils";

function useFetchOfflineTotalSalesLoyalty(
  dimension: KeyDriverDimension = KeyDriverDimension.Store,
) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm, selectedStaffs, selectedDate } =
    useContext(KDOfflineContext);

  const [isFetchingOfflineTotalSalesLoyalty, setIsFetchingOfflineTotalSalesLoyalty] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (dataState: any, dimData: any, columnKey: string) => {
      const { CustomerLte90DaysTotalSales, ShopperLte90DaysTotalSales, OthersTotalSales } =
        KeyDriverField;
      const { Asm, Store, Staff } = KeyDriverDimension;
      let dimensionKey: "department_lv2" | "pos_location_name" | "staff_code" | "" = "";
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
      if (dimensionName) {
        dataState.forEach((dataItem: any) => {
          if (Object.keys(dimData).includes(dataItem.key)) {
            dataItem[`${dimensionName}_${columnKey}`] = dimData[dataItem.key];
            // doanh thu nhóm KH khác = tổng doanh thu các nhóm khách hàng còn lại không show trên BC
            if (dataItem.key === OthersTotalSales) {
              dataItem[`${dimensionName}_${columnKey}`] =
                dimData[dataItem.key] +
                dimData[CustomerLte90DaysTotalSales] +
                dimData[ShopperLte90DaysTotalSales];
            }
            if (columnKey === "accumulatedMonth") {
              dataItem[`${dimensionName}_targetMonth`] = calculateTargetMonth(
                dataItem[`${dimensionName}_accumulatedMonth`],
                selectedDate,
              );
            }
          }
        });
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

  const refetchOfflineTotalSalesLoyalty = useCallback(() => {
    const fetchOfflineTotalSalesLoyalty = async () => {
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
      setIsFetchingOfflineTotalSalesLoyalty(true);
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
          setIsFetchingOfflineTotalSalesLoyalty(false);
          return;
        }
        const dimName = dimension === KeyDriverDimension.Staff ? selectedStores[0] : "";
        let resDayDim: any[] = [];
        if (resDay.length) {
          if (dimension === Asm) {
            const companyDayData = calculateCompanyKeyDriver(resDay);
            resDayDim = [companyDayData, ...resDay];
          } else {
            resDayDim = calculateDimSummary(resDay[0], dimension, dimName);
          }
        }
        if (!resMonth?.length) {
          if (!resMonth && resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Tổng khách mua");
          }
          if (resDay.length) {
            setData((dataPrev: any) => {
              resDayDim.forEach((item: any) => {
                findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
              });
              return [...dataPrev];
            });
          }
          setIsFetchingOfflineTotalSalesLoyalty(false);
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
              const companyMonthData = calculateCompanyKeyDriver(resMonth);
              resMonthDim = [companyMonthData, ...resMonth];
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

      setIsFetchingOfflineTotalSalesLoyalty(false);
    };
    if (selectedDate) {
      fetchOfflineTotalSalesLoyalty();
    }
  }, [
    calculateCompanyKeyDriver,
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
    refetchOfflineTotalSalesLoyalty();
  }, [refetchOfflineTotalSalesLoyalty]);

  return {
    isFetchingOfflineTotalSalesLoyalty,
    refetchOfflineTotalSalesLoyalty,
  };
}

export default useFetchOfflineTotalSalesLoyalty;
