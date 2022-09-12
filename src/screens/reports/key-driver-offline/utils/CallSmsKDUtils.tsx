import { KeyDriverField } from "model/report";
import {
  calculateTargetMonth,
  findKeyDriver,
  nonAccentVietnameseKD,
} from "utils/KeyDriverOfflineUtils";

interface ICallSmsInfo {
  data: any;
  asmData: any;
  columnKey: string;
  asmName?: string;
  selectedDate: string;
  type: "sms" | "call";
  dimKey?: "department_lv2" | "pos_location_name";
}

const calculateChildKD = (callSmsInfo: ICallSmsInfo) => {
  const { data: item, asmData, columnKey, asmName, selectedDate, type } = callSmsInfo;
  if (item.key.includes(`${type}_rate`)) {
    const loyaltyName = item.key.split(`_${type}_rate`)[0];
    item[`${asmName}_${columnKey}`] = asmData[`${loyaltyName}_phone_number_${type}s`]
      ? (
          (asmData[`${loyaltyName}_${type}_conversions`] /
            asmData[`${loyaltyName}_phone_number_${type}s`]) *
          100
        ).toFixed(2)
      : "";
    if (columnKey === "accumulatedMonth") {
      item[`${asmName}_targetMonth`] = item[`${asmName}_accumulatedMonth`];
    }
  } else if (item.key.includes(`${type}s`) || item.key.includes(`${type}_conversions`)) {
    item[`${asmName}_${columnKey}`] = asmData[item.key];
    if (columnKey === "accumulatedMonth") {
      item[`${asmName}_targetMonth`] = calculateTargetMonth(
        item[`${asmName}_accumulatedMonth`],
        selectedDate,
      );
    }
  }
};

export const findKDAndUpdateCallSmsValue = (callSmsInfo: ICallSmsInfo) => {
  const { data, asmData, columnKey, selectedDate, type, dimKey } = callSmsInfo;
  const { CustomersCount, NewTotalSales, OthersTotalSales } = KeyDriverField;
  let customersCount: any = [];
  findKeyDriver(data, CustomersCount, customersCount);
  customersCount = customersCount[0];
  const asmName = nonAccentVietnameseKD(asmData[dimKey || ""]);
  if (customersCount.children?.length) {
    customersCount.children.forEach((child: any) => {
      if (!child.children?.length || [NewTotalSales, OthersTotalSales].includes(child.key)) {
        return;
      }
      child.children.forEach((item: any) => {
        calculateChildKD({ data: item, asmData, columnKey, asmName, selectedDate, type });
        if (item.key.includes(`${type}_conversions`)) {
          item.children.forEach((childItem: any) => {
            calculateChildKD({
              data: childItem,
              asmData,
              columnKey,
              asmName,
              selectedDate,
              type,
            });
          });
        }
      });
    });
  }
};
