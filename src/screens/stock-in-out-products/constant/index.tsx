

export const StockInOutType = {
  stock_in: "stock_in",
  stock_out: "stock_out"
}

export const StockInOutTypeMapping = {
  [StockInOutType.stock_in]: "nhập",
  [StockInOutType.stock_out]: "xuất",
}

export const StockInOutField = {
  store_id: "store_id",
  store: "store",
  type: "type",
  stock_in_out_reason: "stock_in_out_reason",
  account: "account",
  account_code: "account_code", //user_code
  account_name: "account_name", //user_name
  partner_name: "partner_name",
  partner_mobile: "partner_mobile",
  partner_address: "partner_address",
  internal_note: "internal_note",
  partner_note: "partner_note",
  policy_price: "policy_price",
  stock_in_out_other_items: "stock_in_out_other_items",
  stock_in_out_other_items_old: "stock_in_out_other_items_old",
  status: "status"
}

export const StockInOutPolicyPriceField = {
  import_price: "import_price", // giá nhập
  cost_price: "cost_price", // giá vốn
  wholesale_price: "wholesale_price", // giá buôn
  retail_price: "retail_price" //giá bán
}

export const StockInOutPolicyPriceMapping = {
  [StockInOutPolicyPriceField.import_price]: "Giá nhập",
  [StockInOutPolicyPriceField.cost_price]: "Giá vốn",
  [StockInOutPolicyPriceField.wholesale_price]: "Giá buôn",
  [StockInOutPolicyPriceField.retail_price]: "Giá bán",
}

export const StockInPolicyPrice = [
  {key: "import_price", value: "Giá nhập"},
  {key: "cost_price", value: "Giá vốn"},
  {key: "wholesale_price", value: "Giá bán"},
  {key: "retail_price", value: "Giá buôn"},
]

export const StockOutPolicyPriceField = {
  cost_price: "cost_price", // giá vốn
}

export const StockOutPolicyPrice = [
  {key: "cost_price", value: "Giá vốn"},
]

export const StockOutPolicyPriceMapping = {
  [StockOutPolicyPriceField.cost_price]: "Giá vốn",
 
}

export const StockInReasonField = {
  stock_in_gift: "stock_in_gift",
  stock_in_design: "stock_in_design",
  stock_in_change_tem: "stock_in_change_tem",
  stock_in_other: "stock_in_other"
}

export const StockInReasonMappingField = {
  [StockInReasonField.stock_in_change_tem]: "Nhận hàng thay tem",
  [StockInReasonField.stock_in_design]: "Nhận hàng mẫu thiết kế",
  [StockInReasonField.stock_in_gift]: "Nhận hàng quà tặng",
  [StockInReasonField.stock_in_other]: "Khác",
}

export const stockInReason = [
  { key: StockInReasonField.stock_in_gift, value: "Nhận hàng quà tặng" },
  { key: StockInReasonField.stock_in_design, value: "Nhận hàng mẫu thiết kế" },
  { key: StockInReasonField.stock_in_change_tem, value: "Nhận hàng thay tem" },
  { key: StockInReasonField.stock_in_other, value: "Khác" },
]

export const StockOutReasonField = {
  stock_out_defect: "stock_out_defect",
  stock_out_gifts_kol: "stock_out_gifts_kol",
  stock_out_change_tem: "stock_out_change_tem",
  stock_out_other: "stock_out_other"
}

export const stockOutReason = [
  { key: StockOutReasonField.stock_out_defect, value: "Xuất hàng lỗi" },
  { key: StockOutReasonField.stock_out_change_tem, value: "Xuất thay tem" },
  { key: StockOutReasonField.stock_out_gifts_kol, value: "Xuất quà tặng cho KOL" },
  { key: StockOutReasonField.stock_out_other, value: "Khác" },
]

export const StockOutReasonMappingField = {
  [StockOutReasonField.stock_out_change_tem]: "Xuất thay tem",
  [StockOutReasonField.stock_out_defect]: "Xuất hàng lỗi",
  [StockOutReasonField.stock_out_gifts_kol]: "Xuất quà tặng cho KOL",
  [StockOutReasonField.stock_out_other]: "Khác",
}

export const StockInOutStatus = {
  finalized: "finalized",
  cancelled: "cancelled"
}

export const StockInOutStatusMapping = {
  [StockInOutStatus.finalized]: "Đã xác nhận",
  [StockInOutStatus.cancelled]: "Đã hủy",
}

export const StockInOutOthersType = [
  {key: StockInOutType.stock_in, value: "Phiếu nhập"},
  {key: StockInOutType.stock_out, value: "Phiếu xuất"},
]

export const StockInOutBaseFilter = {
  stores: "stores",
  content: "content",
  type: "type"
}

export const StockInOutBaseFilterMapping = {
  [StockInOutBaseFilter.stores]: "Kho hàng",
  [StockInOutBaseFilter.content]: "Thông tin",
  [StockInOutBaseFilter.type]: "Loại phiếu"
}

export const StockInOutAdvancedFilter = {
  stock_in_reasons: "stock_in_reasons",
  stock_out_reasons: "stock_out_reasons",
  account_codes: "account_codes",
  created_by: "created_by",
  partner_name: "partner_name",
  created_date: "created_date",
  status: "status",
  internal_note: "internal_note"
}

export const StockInOutAdvancedFilterMapping = {
  [StockInOutAdvancedFilter.account_codes]: "Người đề xuất",
  [StockInOutAdvancedFilter.created_by]: "Người tạo",
  [StockInOutAdvancedFilter.created_date]: "Ngày tạo",
  [StockInOutAdvancedFilter.status]: "Trạng thái",
  [StockInOutAdvancedFilter.internal_note]: "Ghi chú nội bộ",
  [StockInOutAdvancedFilter.partner_name]: "Đối tác",
  [StockInOutAdvancedFilter.stock_in_reasons]: "Lý do nhập",
  [StockInOutAdvancedFilter.stock_out_reasons]: "Lý do xuất",
}