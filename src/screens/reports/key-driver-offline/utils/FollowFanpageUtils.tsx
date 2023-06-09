import { KeyDriverField } from "model/report";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

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
  const followFanpage = data.find((item: any) => item.key === KeyDriverField.FollowFanpage);
  const asmName = nonAccentVietnameseKD(asmData[dimKey || ""]);
  followFanpage[`${asmName}_${columnKey}`] = asmData.follower_count;
  //   if (columnKey === "accumulatedMonth") {
  //     followFanpage[`${asmName}_targetMonth`] = calculateTargetMonth(
  //       followFanpage[`${asmName}_accumulatedMonth`],
  //       selectedDate,
  //     );
  //   }
};
