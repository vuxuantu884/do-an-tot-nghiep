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

function useFetchKeyDriverTargetDay() {
  const dispatch = useDispatch();
  const { setData, selectedDate } = useContext(KeyDriverOfflineContext);

  const [isFetchingKeyDriverTargetDay, setIsFetchingKeyDriverTargetDay] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, keyDriversTarget: any, asmName: string, keyDriver: any) => {
      if (data.key === keyDriver) {
        data[`${asmName}_day`] = keyDriversTarget[keyDriver].value;
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
    const fetchKeyDriverTargetDay = async () => {
      setIsFetchingKeyDriverTargetDay(true);
      const { YYYYMMDD } = DATE_FORMAT;
      const res = await callApiNative({ isShowError: true }, dispatch, getKeyDriversTarget, {
        "year.equals": moment(selectedDate, YYYYMMDD).year(),
        "month.equals": moment(selectedDate, YYYYMMDD).month() + 1,
        "day.equals": moment(selectedDate, YYYYMMDD).date(),
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu ngày");
        setIsFetchingKeyDriverTargetDay(false);
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
                findKDProductAndUpdateValue(prev[1], kdProductTarget, asmKey, "day");
                Object.keys(kdProfitTarget).forEach((keyDriver) => {
                  findKeyDriverAndUpdateValue(prev[2], kdProfitTarget, asmKey, keyDriver);
                });
              }
            });
          });
        return [...prev];
      });

      setIsFetchingKeyDriverTargetDay(false);
    };
    if (selectedDate) {
      fetchKeyDriverTargetDay();
    }
  }, [dispatch, findKDProductAndUpdateValue, findKeyDriverAndUpdateValue, selectedDate, setData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isFetchingKeyDriverTargetDay, refetch };
}

export default useFetchKeyDriverTargetDay;
