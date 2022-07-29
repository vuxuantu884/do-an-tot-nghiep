import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresKDOfflineTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresKDOfflineTotalSales, setIsFetchingStoresKDOfflineTotalSales] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback((data: any, asmData: any, columnKey: string) => {
    Object.keys(asmData).forEach((keyDriver: any) => {
      const asmName = nonAccentVietnameseKD(asmData["pos_location_name"]);
      if (data.key === keyDriver && asmName) {
        data[`${asmName}_${columnKey}`] = asmData[keyDriver];
        if (
          columnKey === "accumulatedMonth" &&
          ![KeyDriverField.AverageOrderValue, KeyDriverField.AverageCustomerSpent].includes(
            keyDriver,
          )
        ) {
          data[`${asmName}_targetMonth`] = calculateTargetMonth(
            data[`${asmName}_accumulatedMonth`],
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
  }, []);

  const refetchStoresKDOfflineTotalSales = useCallback(() => {
    const fetchStoresKDOfflineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresKDOfflineTotalSales(true);
      const dayApi = callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      });

      const monthApi =
        moment().date() > 1
          ? callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDOfflineTotalSales, {
              from: START_OF_MONTH,
              to: YESTERDAY,
              posLocationNames: selectedStores,
              departmentLv2s: selectedAsm,
            })
          : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt doanh thu offline");
          setIsFetchingStoresKDOfflineTotalSales(false);
          return;
        }

        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế doanh thu offline");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            resDay.forEach((item: any) => {
              findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingStoresKDOfflineTotalSales(false);
          return;
        }

        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resDay.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "actualDay");
          });
          resMonth.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, "accumulatedMonth");
          });
          prev[0] = dataPrev;
          return [...prev];
        });
      });
      setIsFetchingStoresKDOfflineTotalSales(false);
    };
    fetchStoresKDOfflineTotalSales();
  }, [dispatch, findKeyDriverAndUpdateValue, selectedAsm, setData, selectedStores]);

  useEffect(() => {
    refetchStoresKDOfflineTotalSales();
  }, [refetchStoresKDOfflineTotalSales]);

  return {
    isFetchingStoresKDOfflineTotalSales,
    refetchStoresKDOfflineTotalSales,
  };
}

export default useFetchStoresKDOfflineTotalSales;
