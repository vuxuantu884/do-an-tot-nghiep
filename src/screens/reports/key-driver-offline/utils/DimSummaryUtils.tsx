import { KeyDriverDimension } from "model/report";
import { nonAccentVietnameseKD } from "utils/KeyDriverOfflineUtils";

interface DimKeys {
  asmDim: string;
  storeDim: string;
}

export const calculateDimSummary = (
  data: any,
  dimension: KeyDriverDimension,
  dimName: string,
  dimKeys: DimKeys = {
    asmDim: "department_lv2",
    storeDim: "pos_location_name",
  },
) => {
  const { pos_locations, fan_page_list, ...others } = data;
  const { asmDim, storeDim } = dimKeys;
  return dimension === KeyDriverDimension.Staff
    ? [
        {
          ...others,
          [storeDim]: data[asmDim],
          [asmDim]: data[asmDim],
          staff_name: dimName,
          staff_code: nonAccentVietnameseKD(dimName),
        },
        ...(pos_locations || fan_page_list),
      ]
    : [
        { ...others, [storeDim]: data[asmDim], [asmDim]: data[asmDim] },
        ...(pos_locations || fan_page_list),
      ];
};
