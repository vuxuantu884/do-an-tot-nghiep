import { KDGroup } from "model/report";
import moment from "moment";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getKeyDriversTarget } from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  findKDProductAndUpdateValueUtil,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";
import { showErrorReport } from "utils/ReportUtils";
import { ASM_LIST } from "../constant/key-driver-offline-template-data";
import { KeyDriverOfflineContext } from "../provider/key-driver-offline-provider";

function useFetchKeyDriverTarget() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingKeyDriverTarget, setIsFetchingKeyDriverTarget] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, keyDriversTarget: any, asmName: string, targetTime: "month" | "day") => {
      Object.keys(keyDriversTarget).forEach((keyDriver) => {
        if (data.key === keyDriver) {
          data[`${asmName}_${targetTime}`] = keyDriversTarget[keyDriver].value;
          if (!data[`${asmName}_month`]) {
            data[`${asmName}_day`] = "";
          }
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

  const findKDProductAndUpdateValue = useCallback(findKDProductAndUpdateValueUtil, []);

  const refetch = useCallback(() => {
    const fetchKeyDriverTarget = async () => {
      setIsFetchingKeyDriverTarget(true);
      const { YYYYMMDD } = DATE_FORMAT;
      const res = await callApiNative({ isShowError: true }, dispatch, getKeyDriversTarget, {
        "year.equals": moment(selectedDate, YYYYMMDD).year(),
        "month.equals": moment(selectedDate, YYYYMMDD).month() + 1,
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu");
        setIsFetchingKeyDriverTarget(false);
        return;
      }

      setData((prev: any) => {
        res
          .filter((item: any) =>
            ["COMPANY", ...ASM_LIST.map((asmItem) => nonAccentVietnameseKD(asmItem))].includes(
              item.department,
            ),
          )
          .forEach((item: any) => {
            const { department } = item;
            const kdTotalSalesTarget = Object.keys(item.data).reduce((res0, key: string) => {
              if (!key.includes(KDGroup.SKU3)) {
                res0 = { ...res0, [key]: item.data[key] };
              }
              return res0;
            }, {});
            const kdProductTarget = Object.keys(item.data).reduce((res1, key: string) => {
              if (key.includes(KDGroup.SKU3)) {
                res1 = { ...res1, [key]: item.data[key] };
              }
              return res1;
            }, {});

            ["COMPANY", ...ASM_LIST].forEach((asm) => {
              const asmKey = nonAccentVietnameseKD(asm);
              if (department === asmKey) {
                findKeyDriverAndUpdateValue(prev[0], kdTotalSalesTarget, asmKey, "month");
                findKDProductAndUpdateValue(prev[1], kdProductTarget, asmKey, "month");
              }
            });
          });
        return [...prev];
      });

      setIsFetchingKeyDriverTarget(false);
    };
    if (selectedDate) {
      fetchKeyDriverTarget();
    }
  }, [dispatch, findKDProductAndUpdateValue, findKeyDriverAndUpdateValue, selectedDate, setData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isFetchingKeyDriverTarget, refetch };
}

export default useFetchKeyDriverTarget;
