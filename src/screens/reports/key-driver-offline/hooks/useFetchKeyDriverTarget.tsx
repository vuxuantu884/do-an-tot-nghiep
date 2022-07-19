import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKeyDriversTarget } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchKeyDriverTarget() {
  const dispatch = useDispatch();
  const { setData } = useContext(KeyDriverOfflineContext);

  const [isFetchingKeyDriverTarget, setIsFetchingKeyDriverTarget] = useState<boolean | undefined>();

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
    []
  );

  const refetch = useCallback(() => {
    const fetchKeyDriverTarget = async () => {
      setIsFetchingKeyDriverTarget(true);

      const res = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKeyDriversTarget, {
        "year.equals": moment().year(),
        "month.equals": moment().month() + 1,
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu");
        setIsFetchingKeyDriverTarget(false);
        return;
      }

      setData((prev: any) => {
        let dataPrev: any = prev[0];
        res.forEach((item: any) => {
          const { department, data: keyDriversTarget } = item;
          [ "COMPANY", ...ASM_LIST].forEach(asm => {
            const asmKey = nonAccentVietnamese(asm);
            if (department === asmKey) {
              findKeyDriverAndUpdateValue(dataPrev, keyDriversTarget, asmKey, "month");
            }
          });
        });
        return [dataPrev];
      });
      
      setIsFetchingKeyDriverTarget(false);
    };
    fetchKeyDriverTarget();
  }, [dispatch, findKeyDriverAndUpdateValue, setData]);

  useEffect(() => {
    refetch()
  }, [refetch])

  return { isFetchingKeyDriverTarget, refetch };
}

export default useFetchKeyDriverTarget;
