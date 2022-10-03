import { ASM_LIST, KDGroup, KeyDriverDimension, KeyDriverField } from "model/report";
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

function useFetchKDTargetDay(dimension: KeyDriverDimension = KeyDriverDimension.Store) {
  const dispatch = useDispatch();
  const { setData, selectedStores, selectedStaffs, selectedDate, selectedAsm } =
    useContext(KDOfflineContext);

  const [isFetchingKDTargetDay, setIsFetchingKDTargetDay] = useState<boolean | undefined>();

  const findKeyDriverAndUpdateValue = useCallback(
    (dataState: any, keyDriversTarget: any, asmName: string) => {
      dataState.forEach((dataItem: any) => {
        if (Object.keys(keyDriversTarget).includes(dataItem.key)) {
          dataItem[`${asmName}_day`] = keyDriversTarget[dataItem.key].value;
        }
      });
    },
    [],
  );

  const findKDProductAndUpdateValue = useCallback(findKDProductAndUpdateValueUtil, []);

  const refetch = useCallback(() => {
    const fetchKDTargetDay = async () => {
      setIsFetchingKDTargetDay(true);
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
      const { YYYYMMDD } = DATE_FORMAT;
      const res = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, getKeyDriversTarget, {
        "year.equals": moment(selectedDate, YYYYMMDD).year(),
        "month.equals": moment(selectedDate, YYYYMMDD).month() + 1,
        "day.equals": moment(selectedDate, YYYYMMDD).date(),
      });

      if (!res) {
        showErrorReport("Lỗi khi lấy dữ liệu mục tiêu ngày");
        setIsFetchingKDTargetDay(false);
        return;
      }

      setData((prev: any) => {
        const { SKU3, PROFIT } = KDGroup;
        let resMapper = [];
        if (dimension === Store) {
        } else if (dimension === Staff) {
        }
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
                ...selectedStaffs.map((item) => JSON.parse(item).code.toUpperCase()),
                nonAccentVietnameseKD(selectedStores[0]),
              ].includes(item.department),
            );
            break;

          default:
            break;
        }

        resMapper.forEach((item: any) => {
          const { department } = item;
          let kdTotalSalesTarget: any = {};
          let kdProductTarget: any = {};
          let kdProfitTarget: any = {};
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
              findKeyDriverAndUpdateValue(
                prev,
                { ...kdTotalSalesTarget, ...kdProfitTarget },
                asmKey,
              );
              findKDProductAndUpdateValue(
                prev.find((item: any) => item.key === KeyDriverField.ProductTotalSales),
                kdProductTarget,
                asmKey,
                "day",
              );
            }
          });
        });
        return [...prev];
      });
      setIsFetchingKDTargetDay(false);
    };
    if (selectedDate) {
      fetchKDTargetDay();
    }
  }, [
    selectedDate,
    dimension,
    selectedStores,
    selectedAsm,
    selectedStaffs,
    dispatch,
    setData,
    findKeyDriverAndUpdateValue,
    findKDProductAndUpdateValue,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { isFetchingKDTargetDay, refetch };
}

export default useFetchKDTargetDay;
