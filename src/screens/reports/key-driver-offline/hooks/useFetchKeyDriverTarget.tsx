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
    (data: any, keyDriversTarget: any, asmName: string, keyDriver: any) => {
      if (data.key === keyDriver) {
        data[`${asmName}_month`] = keyDriversTarget[keyDriver].value;
        if (!data[`${asmName}_month`]) {
          data[`${asmName}_day`] = "";
        }
      } else {
        if (data.children?.length) {
          data.children.forEach((item: any) => {
            findKeyDriverAndUpdateValue(item, keyDriversTarget, asmName, keyDriver);
          });
        }
      }
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
        const { SKU3, PROFIT } = KDGroup;
        res
          .filter((item: any) =>
            ["COMPANY", ...ASM_LIST.map((asmItem) => nonAccentVietnameseKD(asmItem))].includes(
              item.department,
            ),
          )
          .forEach((item: any) => {
            const { department } = item;
            let kdTotalSalesTarget: any[] = [];
            let kdProductTarget: any[] = [];
            let kdProfitTarget: any[] = [];
            Object.keys(item.data).forEach((key: string) => {
              if (key.includes(SKU3)) {
                kdProductTarget = { ...kdProductTarget, [key]: item.data[key] };
              } else if (key.includes(PROFIT)) {
                kdProfitTarget = { ...kdProfitTarget, [key]: item.data[key] };
              } else {
                kdTotalSalesTarget = { ...kdTotalSalesTarget, [key]: item.data[key] };
              }
            });

            ["COMPANY", ...ASM_LIST].forEach((asm) => {
              const asmKey = nonAccentVietnameseKD(asm);
              if (department === asmKey) {
                Object.keys(kdTotalSalesTarget).forEach((keyDriver) => {
                  findKeyDriverAndUpdateValue(prev[0], kdTotalSalesTarget, asmKey, keyDriver);
                });
                findKDProductAndUpdateValue(prev[1], kdProductTarget, asmKey, "month");
                Object.keys(kdProfitTarget).forEach((keyDriver) => {
                  findKeyDriverAndUpdateValue(prev[2], kdProfitTarget, asmKey, keyDriver);
                });
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
