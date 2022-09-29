import { calculateTargetMonth, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

interface ICallSmsInfo {
  dataState: any;
  dimData: any;
  columnKey: string;
  asmName?: string;
  selectedDate: string;
  type: "sms" | "call";
  dimKey?: "department_lv2" | "pos_location_name";
}

export const findKDAndUpdateCallSmsValue = (callSmsInfo: ICallSmsInfo) => {
  const { dataState, dimData, columnKey, selectedDate, type, dimKey } = callSmsInfo;
  const asmName = nonAccentVietnameseKD(dimData[dimKey || ""]);
  dataState.forEach((dataItem: any) => {
    if (Object.keys(dimData).includes(dataItem.key)) {
      dataItem[`${asmName}_${columnKey}`] = dimData[dataItem.key];
      if (columnKey === "accumulatedMonth") {
        dataItem[`${asmName}_targetMonth`] = calculateTargetMonth(
          dataItem[`${asmName}_accumulatedMonth`],
          selectedDate,
        );
      }
    }
    if (dataItem.key?.includes(`${type}_rate`)) {
      const loyaltyName = dataItem.key.split(`_${type}_rate`)[0];
      dataItem[`${asmName}_${columnKey}`] = dimData[`${loyaltyName}_phone_number_${type}s`]
        ? (
            (dimData[`${loyaltyName}_${type}_conversions`] /
              dimData[`${loyaltyName}_phone_number_${type}s`]) *
            100
          ).toFixed(2)
        : "";
      if (columnKey === "accumulatedMonth") {
        dataItem[`${asmName}_targetMonth`] = dataItem[`${asmName}_accumulatedMonth`];
      }
    }
  });
};
