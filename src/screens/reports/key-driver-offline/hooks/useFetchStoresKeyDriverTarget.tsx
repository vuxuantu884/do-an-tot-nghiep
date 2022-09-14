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
  const { setData, selectedStores, selectedStaffs, selectedDate, selectedAsm } =
    useContext(KDOfflineStoresContext);

  const [isFetchingStoresKeyDriverTarget, setIsFetchingStoresKeyDriverTarget] = useState<
    boolean | undefined
  >();

  const findKeyDriverAndUpdateValue = useCallback(
    (data: any, keyDriversTarget: any, asmName: string, keyDriver) => {
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
    const fetchStoresKeyDriverTarget = async () => {
      if (!selectedStores.length || !selectedAsm.length) {
        return;
      }
      if (
        dimension === KeyDriverDimension.Staff &&
        (!selectedStores.length || !selectedStaffs.length || !selectedAsm.length)
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
            [...selectedStores, selectedAsm[0]]
              .map((asmItem) => nonAccentVietnameseKD(asmItem))
              .includes(item.department),
          );
        } else if (dimension === KeyDriverDimension.Staff) {
          resMapper = res.filter((item: any) =>
            [
              ...selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase()),
              nonAccentVietnameseKD(selectedStores[0]),
            ].includes(item.department),
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
            selectedData = [
              ...selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase()),
              selectedStores[0],
            ];
          } else if (dimension === KeyDriverDimension.Store) {
            selectedData = [...selectedStores, selectedAsm[0]];
          }
          [...selectedData].forEach((asm) => {
            const asmKey = nonAccentVietnameseKD(asm);
            if (department === asmKey) {
              Object.keys(kdTotalSalesTarget).forEach((keyDriver) => {
                findKeyDriverAndUpdateValue(prev[0], kdTotalSalesTarget, asmKey, keyDriver);
              });
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
    selectedDate,
    selectedStores,
    selectedAsm,
    dimension,
    selectedStaffs,
    dispatch,
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
