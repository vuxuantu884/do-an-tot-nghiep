import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import { KeyDriverField } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCustomerVisitors } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresCustomerVisitors() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(
    KDOfflineStoresContext,
  );

  const [
    isFetchingStoresCustomerVisitors,
    setIsFetchingStoresCustomerVisitors,
  ] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
      let visitors: any = [];
      findKeyDriver(data, KeyDriverField.Visitors, visitors);
      visitors = visitors[0];
      const asmName = nonAccentVietnameseKD(asmData["pos_location_name"]);
      if (asmName) {
        visitors[`${asmName}_${columnKey}`] = asmData.value;
        if (columnKey === "accumulatedMonth") {
          visitors[`${asmName}_targetMonth`] = calculateTargetMonth(
            visitors[`${asmName}_accumulatedMonth`],
          );
        }
      }
    },
    [],
  );

  const refetchStoresCustomerVisitors = useCallback(() => {
    const fetchStoresCustomerVisitors = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresCustomerVisitors(true);
      const dayApi = callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getKDCustomerVisitors,
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
              getKDCustomerVisitors,
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
          showErrorReport("Lỗi khi lấy dữ liệu thực đạt Khách vào cửa hàng");
          setIsFetchingStoresCustomerVisitors(false);
          return;
        }
        if (!resMonth) {
          if (resMonth !== 0) {
            showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Khách vào cửa hàng");
          }
          setData((prev: any) => {
            let dataPrev: any = prev[0];
            resDay.forEach((item: any) => {
              findKeyDriverAndUpdateValue(prev[0], item, "actualDay");
            });
            prev[0] = dataPrev;
            return [...prev];
          });
          setIsFetchingStoresCustomerVisitors(false);
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
      setIsFetchingStoresCustomerVisitors(false);
    };
    fetchStoresCustomerVisitors();
  }, [
    dispatch,
    findKeyDriverAndUpdateValue,
    selectedAsm,
    selectedStores,
    setData,
  ]);

  useEffect(() => {
    refetchStoresCustomerVisitors();
  }, [refetchStoresCustomerVisitors]);

  return { isFetchingStoresCustomerVisitors, refetchStoresCustomerVisitors };
}

export default useFetchStoresCustomerVisitors;
