export enum DefectFilterEnum {
  store_ids = "store_ids",
  condition = "condition",
  info = "info",
  from_date = "from_date",
  to_date = "to_date",
  from_defect = "from_defect",
  to_defect = "to_defect",
  defect_quantity = "defect_quantity",
  transaction_date = "transaction_date",
  updated_by = "updated_by",
}

export const DefectFilterName = {
  [DefectFilterEnum.store_ids]: "Cửa hàng",
  [DefectFilterEnum.condition]: "Thông tin tìm kiếm",
  [DefectFilterEnum.transaction_date]: "Ngày thao tác",
  [DefectFilterEnum.defect_quantity]: "Số lượng lỗi",
};

export type DefectFilterTag = {
  key: string;
  name: string;
  value: string;
};
