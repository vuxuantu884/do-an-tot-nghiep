import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDOfflineOnlineTotalSales } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresOfflineOnlineTotalSales() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(
    KDOfflineStoresContext,
  );

  const [
    isFetchingStoresOfflineOnlineTotalSales,
    setIsFetchingStoresOfflineOnlineTotalSales,
  ] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let uniformOnlineTotalSales: any = [];
      findKeyDriver(
        data,
        KeyDriverField.UniformOnlineTotalSales,
        uniformOnlineTotalSales,
      );
      uniformOnlineTotalSales = uniformOnlineTotalSales[0];
      const asmName = nonAccentVietnameseKD(asmData["pos_location_name"]);
      if (asmName) {
        uniformOnlineTotalSales[`${asmName}_${columnKey}`] =
          asmData[KeyDriverField.UniformOnlineTotalSales];
        if (columnKey === "accumulatedMonth") {
          uniformOnlineTotalSales[`${asmName}_targetMonth`] =
            calculateTargetMonth(
              uniformOnlineTotalSales[`${asmName}_accumulatedMonth`],
            );
        }
      }
    },
    [],
  );

  const refetchStoresOfflineOnlineTotalSales = useCallback(() => {
    const fetchStoresOfflineOnlineTotalSales = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresOfflineOnlineTotalSales(true);
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDOfflineOnlineTotalSales,
        {
          from: TODAY,
          to: TODAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm,
        },
      );
      const monthApi =
        moment().date() > 1
          ? callApiNative(
              { notifyAction: "SHOW_ALL" },
              dispatch,
              getKDOfflineOnlineTotalSales,
              {
                from: START_OF_MONTH,
                to: YESTERDAY,
                posLocationNames: selectedStores,
                departmentLv2s: selectedAsm,
              },
            )
          : Promise.resolve(0);

      await Promise.all([dayApi, monthApi]).then(([resDay, resMonth]) => {
        if (!resDay) {
          showErrorReport(
            "Lỗi khi lấy dữ liệu thực đạt Doanh thu đóng hàng Online",
          );
          setIsFetchingStoresOfflineOnlineTotalSales(false);
          return;
        }
        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport(
              "Lỗi khi lấy dữ liệu TT luỹ kế Doanh thu đóng hàng Online",
            );
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
    fetchStoresOfflineOnlineTotalSales();
  }, [
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
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
