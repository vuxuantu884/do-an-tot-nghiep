import { ASM_LIST, KDGroup, KeyDriverDimension } from "model/report";
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
import { KDOfflineContext } from "../provider/kd-offline-provider";

function useFetchKeyDriverTarget(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedStaffs, selectedDate, selectedAsm } =
    useContext(KDOfflineContext);

  const [isFetchingKeyDriverTarget, setIsFetchingKeyDriverTarget] = useState<boolean | undefined>();

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
      const { Asm, Store, Staff } = KeyDriverDimension;
      if (dimension === Store && (!selectedStores.length || !selectedAsm.length)) {
        return;
      }
      if (
        dimension === Staff &&
        (!selectedStores.length || !selectedStaffs.length || !selectedAsm.length)
      ) {
        return;
      }
      setIsFetchingKeyDriverTarget(true);
      const { YYYYMMDD } = DATE_FORMAT;
      const res = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKeyDriversTarget, {
        "year.equals": moment(selectedDate, YYYYMMDD).year(),
        "month.equals": moment(selectedDate, YYYYMMDD).month() + 1,
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu tháng");
        setIsFetchingKeyDriverTarget(false);
        return;
      }

      setData((prev: any) => {
        const { SKU3, PROFIT } = KDGroup;
        let resMapper = [];
        switch (dimension) {
          case Asm:
            resMapper = res.filter((item: any) =>
              ["COMPANY", ...ASM_LIST.map((asmItem) => nonAccentVietnameseKD(asmItem))].includes(
                item.department,
              ),
            );
            break;
          case Store:
            resMapper = res.filter((item: any) =>
              [...selectedStores, selectedAsm[0]]
                .map((asmItem) => nonAccentVietnameseKD(asmItem))
                .includes(item.department),
            );
            break;
          case Staff:
            resMapper = res.filter((item: any) =>
              [
                ...selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase()),
                nonAccentVietnameseKD(selectedStores[0]),
              ].includes(item.department),
            );
            break;

          default:
            break;
        }

        resMapper.forEach((item: any) => {
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
          let selectedData: any[] = [];
          switch (dimension) {
            case Asm:
              selectedData = ["COMPANY", ...ASM_LIST];
              break;
            case Store:
              selectedData = [...selectedStores, selectedAsm[0]];
              break;
            case Staff:
              selectedData = [
                ...selectedStaffs.map((staff) => JSON.parse(staff).code.toUpperCase()),
                selectedStores[0],
              ];
              break;

            default:
              break;
          }
          [...selectedData].forEach((asm) => {
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

  return { isFetchingKeyDriverTarget, refetch };
}

export default useFetchKeyDriverTarget;
