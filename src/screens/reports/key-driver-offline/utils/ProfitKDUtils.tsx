import { KDGroup, KeyDriverField } from "model/report";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

interface IProfitInfo {
  dataState: any;
  dimData: any;
  columnKey: string;
  asmName?: string;
  selectedDate: string;
  dimKey?: "department_lv2" | "pos_location_name";
}

export const findKDAndUpdateProfitKD = (callSmsInfo: IProfitInfo) => {
  const { dataState, dimData, columnKey, selectedDate, dimKey } = callSmsInfo;
  dataState.forEach((dataItem: any) => {
    const keyDriverNoSuffix = dataItem.key?.split(KDGroup.PROFIT)[0];
    if (Object.keys(dimData).includes(keyDriverNoSuffix)) {
      const dimName = nonAccentVietnameseKD(dimData[dimKey || ""]);
      const { Cost, Shipping } = KeyDriverField;
      dataItem[`${dimName}_${columnKey}`] = dimData[keyDriverNoSuffix];
      if (columnKey === "accumulatedMonth") {
        dataItem[`${dimName}_targetMonth`] = ![Cost, Shipping].includes(
          dataItem.key as KeyDriverField,
        )
          ? calculateTargetMonth(dataItem[`${dimName}_accumulatedMonth`], selectedDate)
          : "";
      }
    }
  });
};
