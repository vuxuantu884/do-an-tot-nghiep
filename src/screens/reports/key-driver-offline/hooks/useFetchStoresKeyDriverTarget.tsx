import { KDGroup, KeyDriverDimension } from "model/report";
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
import { KDOfflineStoresContext } from "../provider/kd-offline-stores-provider";

function useFetchStoresKeyDriverTarget(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedStaffs, selectedDate } =
    useContext(KDOfflineStoresContext);

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

  const findKDProductAndUpdateValue = useCallback(findKDProductAndUpdateValueUtil, []);

  const refetch = useCallback(() => {
    const fetchStoresKeyDriverTarget = async () => {
      if (!selectedStores.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedStaffs.length)
      ) {
        return;
      }
      setIsFetchingStoresKeyDriverTarget(true);
      const { YYYYMMDD } = DATE_FORMAT;
      const res = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKeyDriversTarget, {
        "year.equals": moment(selectedDate, YYYYMMDD).year(),
        "month.equals": moment(selectedDate, YYYYMMDD).month() + 1,
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu tháng");
        setIsFetchingStoresKeyDriverTarget(false);
        return;
      }

      setData((prev: any) => {
        let resMapper = [];
        if (dimension === KeyDriverDimension.Store) {
          resMapper = res.filter((item: any) =>
            [...selectedStores.map((asmItem) => nonAccentVietnameseKD(asmItem))].includes(
              item.department,
            ),
          );
        } else if (dimension === KeyDriverDimension.Staff) {
          resMapper = res.filter((item: any) =>
            [...selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase())].includes(
              item.department,
            ),
          );
        }

        resMapper.forEach((item: any) => {
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
          let selectedData: any[] = [];
          if (dimension === KeyDriverDimension.Staff) {
            selectedData = selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase());
          } else if (dimension === KeyDriverDimension.Store) {
            selectedData = selectedStores;
          }
          [...selectedData].forEach((asm) => {
            const asmKey = nonAccentVietnameseKD(asm);
            if (department === asmKey) {
              findKeyDriverAndUpdateValue(prev[0], kdTotalSalesTarget, asmKey, "month");
              findKDProductAndUpdateValue(prev[1], kdProductTarget, asmKey, "month");
            }
          });
        });
        return [...prev];
      });
      setIsFetchingStoresKeyDriverTarget(false);
    };
    if (selectedDate) {
      fetchStoresKeyDriverTarget();
    }
  }, [
    selectedStores,
    dimension,
    selectedStaffs,
    dispatch,
    selectedDate,
    setData,
    findKeyDriverAndUpdateValue,
    findKDProductAndUpdateValue,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isFetchingStoresKeyDriverTarget, refetch };
}

export default useFetchStoresKeyDriverTarget;
