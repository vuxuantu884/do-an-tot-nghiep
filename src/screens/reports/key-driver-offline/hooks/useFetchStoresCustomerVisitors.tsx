import { START_OF_MONTH, TODAY, YESTERDAY } from "config/dashboard";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKDCustomerVisitors } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { calculateTargetMonth, nonAccentVietnamese } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresCustomerVisitors() {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedAsm } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresCustomerVisitors, setIsFetchingStoresCustomerVisitors] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, asmData: any, columnKey: string) => {
        const asmName = nonAccentVietnamese(asmData['pos_location_name']);
        if (data.key === 'visitors' && asmName) {
          data[`${asmName}_${columnKey}`] = asmData.value;
          if (columnKey === 'accumulatedMonth') {
            data[`${asmName}_targetMonth`] = calculateTargetMonth(data[`${asmName}_accumulatedMonth`]);
          }
        } else {
          if (data.children?.length) {
            data.children.forEach((item: any) => {
              findKeyDriverAndUpdateValue(item, asmData, columnKey);
            });
          }
        }
    },
    []
  );

  const refetchStoresCustomerVisitors = useCallback(() => {
    const fetchStoresCustomerVisitors = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      setIsFetchingStoresCustomerVisitors(true);      
      const resDay = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCustomerVisitors, {
        from: TODAY,
        to: TODAY,
        posLocationNames: selectedStores,
        departmentLv2s: selectedAsm,
      });

      if (!resDay) {
        showErrorReport("Lỗi khi lấy dữ liệu thực đạt Khách vào cửa hàng");
        setIsFetchingStoresCustomerVisitors(false);
        return;
      }
      setData((prev: any) => {
        let dataPrev: any = prev[0];
        resDay.forEach((item: any) => {
          findKeyDriverAndUpdateValue(dataPrev, item, 'actualDay');
        });
        return [dataPrev];
      });

      if (moment().date() > 1) {
        const resMonth = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKDCustomerVisitors, {
          from: START_OF_MONTH,
          to: YESTERDAY,
          posLocationNames: selectedStores,
          departmentLv2s: selectedAsm,
        });
        if (!resMonth) {
          showErrorReport("Lỗi khi lấy dữ liệu TT luỹ kế Khách vào cửa hàng");
          setIsFetchingStoresCustomerVisitors(false);
          return;
        }
  
        setData((prev: any) => {
          let dataPrev: any = prev[0];
          resMonth.forEach((item: any) => {
            findKeyDriverAndUpdateValue(dataPrev, item, 'accumulatedMonth');
          });
          return [dataPrev];
        });
      }

      setIsFetchingStoresCustomerVisitors(false);
    };
    fetchStoresCustomerVisitors();
  }, [dispatch, findKeyDriverAndUpdateValue, selectedAsm, selectedStores, setData]);

  useEffect(() => {
    refetchStoresCustomerVisitors();
  }, [refetchStoresCustomerVisitors]);

  return { isFetchingStoresCustomerVisitors, refetchStoresCustomerVisitors };
}

export default useFetchStoresCustomerVisitors;
