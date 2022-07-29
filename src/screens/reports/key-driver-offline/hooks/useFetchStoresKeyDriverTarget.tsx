import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKeyDriversTarget } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresKeyDriverTarget() {
  const dispatch = useDispatch();
  const { setData, selectedStores } = useContext(KDOfflineStoresContext);

  const [isFetchingStoresKeyDriverTarget, setIsFetchingStoresKeyDriverTarget] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, keyDriversTarget: any, asmName: string, targetTime: "month" | "day") => {
      Object.keys(keyDriversTarget).forEach((keyDriver) => {
        if (data.key === keyDriver) {
          data[`${asmName}_${targetTime}`] = keyDriversTarget[keyDriver].value;
        } else {
          if (data.children?.length) {
            data.children.forEach((item: any) => {
              findKeyDriverAndUpdateValue(item, keyDriversTarget, asmName, targetTime);
            });
          }
        }
      });
    },
    [],
  );

  const refetch = useCallback(() => {
    const fetchStoresKeyDriverTarget = async () => {
      if (!selectedStores.length) {
        return;
      }
      setIsFetchingStoresKeyDriverTarget(true);

      const res = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKeyDriversTarget, {
        "year.equals": moment().year(),
        "month.equals": moment().month() + 1,
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu");
        setIsFetchingStoresKeyDriverTarget(false);
        return;
      }

      setData((prev: any) => {
        let dataPrev: any = prev[0];
        res.forEach((item: any) => {
          const { department, data: keyDriversTarget } = item;
          [...selectedStores].forEach((asm) => {
            const asmKey = nonAccentVietnameseKD(asm);
            if (department === asmKey) {
              findKeyDriverAndUpdateValue(dataPrev, keyDriversTarget, asmKey, "month");
            }
          });
        });
        prev[0] = dataPrev;
        return [...prev];
      });

      setIsFetchingStoresKeyDriverTarget(false);
    };
    fetchStoresKeyDriverTarget();
  }, [dispatch, findKeyDriverAndUpdateValue, setData, selectedStores]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isFetchingStoresKeyDriverTarget, refetch };
}

export default useFetchStoresKeyDriverTarget;
