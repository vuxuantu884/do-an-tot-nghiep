
export const STATUS_INVENTORY_ADJUSTMENT = {
  DRAFT : {
    status: "draft",
    name: "Kế hoạch"
  },
  INITIALIZING: {
    status: "initializing",
    name: "Đang khởi tạo"
  },
  AUDITED : {
    status: "audited",
    name: "Đã kiểm"
  },
  ADJUSTED : {
    status: "adjusted",
    name: "Đã cân tồn"
  },
}

export const STATUS_INVENTORY_ADJUSTMENT_ARRAY = [
  {
    value: "draft",
    name: "Kế hoạch"
  },
  {
    value: "audited",
    name: "Đã kiểm"
  },
  {
    value: "adjusted",
    name: "Đã cân tồn"
  },
]

export const INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY= [
  {
    value: "total",
    name: "Toàn bộ"
  },
  {
    value: "partly",
    name: "Một phần"
  },
]

export const INVENTORY_ADJUSTMENT_AUDIT_TYPE_CONSTANTS= []
