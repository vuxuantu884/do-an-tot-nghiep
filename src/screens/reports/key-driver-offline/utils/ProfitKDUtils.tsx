import { KDGroup, KeyDriverField } from "model/report";
import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

interface IProfitInfo {
  data: any;
  dimData: any;
  columnKey: string;
  asmName?: string;
  selectedDate: string;
  dimKey?: "department_lv2" | "pos_location_name";
  keyDriver: string;
}

export const findKDAndUpdateProfitKD = (callSmsInfo: IProfitInfo) => {
  const { data, dimData, columnKey, selectedDate, dimKey, keyDriver } = callSmsInfo;
  const keyDriverHaveSuffix = `${keyDriver}${KDGroup.PROFIT}`;
  const dimName = nonAccentVietnameseKD(dimData[dimKey || ""]);
  const { Profit, Cost, Shipping } = KeyDriverField;
  if (keyDriverHaveSuffix === Profit) {
    data[`${dimName}_${columnKey}`] = dimData[keyDriver];
    if (columnKey === "accumulatedMonth") {
      data[`${dimName}_targetMonth`] = calculateTargetMonth(
        data[`${dimName}_accumulatedMonth`],
        selectedDate,
      );
    }
  } else {
    data.children.forEach((child: any) => {
      if (child.key === keyDriverHaveSuffix && dimName) {
        child[`${dimName}_${columnKey}`] = dimData[keyDriver];
        if (columnKey === "accumulatedMonth") {
          child[`${dimName}_targetMonth`] = ![Cost, Shipping].includes(
            keyDriverHaveSuffix as KeyDriverField,
          )
            ? calculateTargetMonth(child[`${dimName}_accumulatedMonth`], selectedDate)
            : "";
        }
      }
    });
  }
};
