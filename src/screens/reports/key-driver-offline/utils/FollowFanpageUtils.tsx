import { KeyDriverField } from "model/report";
import { findKeyDriver, nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

interface IFollowFanpageInfo {
  data: any;
  asmData: any;
  columnKey: string;
  asmName?: string;
  selectedDate: string;
  dimKey?: "department_lv2" | "pos_location_name" | "store_name" | undefined;
}

export const findKDAndUpdateFollowFanpageValue = (followFanpageInfo: IFollowFanpageInfo) => {
  const { data, asmData, columnKey, dimKey } = followFanpageInfo;
  const { FollowFanpage } = KeyDriverField;
  let followFanpage: any = [];
  findKeyDriver(data, FollowFanpage, followFanpage);
  followFanpage = followFanpage[0];
  const asmName = nonAccentVietnameseKD(asmData[dimKey || ""]);
  followFanpage[`${asmName}_${columnKey}`] = asmData.follower_count;
  //   if (columnKey === "accumulatedMonth") {
  //     followFanpage[`${asmName}_targetMonth`] = calculateTargetMonth(
  //       followFanpage[`${asmName}_accumulatedMonth`],
  //       selectedDate,
  //     );
  //   }
};
