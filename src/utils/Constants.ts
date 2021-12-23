export const VietNamId = 233;

export const optionAllCities = {
  name: "Tất cả tỉnh thành",
  id: -1,
};

export const PaymentMethodCode = {
  CASH: "cash",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  QR_CODE: "qr_pay",
  POINT: "point",
};

export const OrderStatus = {
  DRAFT: "draft",
  FINALIZED: "finalized",
  COMPLETED: "completed",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

export const TaxTreatment = {
  INCLUSIVE: "inclusive",
  EXCLUSIVE: "exclusive",
};
export const AddressType = {
  BILLADDRESS: "billaddress",
  SUPPLIERADDRESS: "supplieraddress",
};

export const PoFormName = {
  Main: "formMain",
  Supplier: "formSupplier",
  Product: "formPoProduct",
  Info: "formInfo",
};

export const FulFillmentStatus = {
  UNSHIPPED: "unshipped",
  PICKED: "picked",
  PARTIAL: "partial",
  PACKED: "packed",
  SHIPPING: "shipping",
  SHIPPED: "shipped",
  CANCELLED: "cancelled",
  RETURNING: "returning",
  RETURNED: "returned",
};

export const MoneyType = {
  MONEY: "money",
  PERCENT: "percent",
};

export const PaymentMethodOption = {
  COD: 1,
  PREPAYMENT: 2,
  POSTPAYMENT: 3,
};

export const ShipmentMethodOption = {
  DELIVER_PARTNER: 1,
  SELF_DELIVER: 2,
  PICK_AT_STORE: 3,
  DELIVER_LATER: 4,
};

export const ShipmentMethod = {
  PICK_AT_STORE: "pick_at_store",
  EXTERNAL_SERVICE: "external_service",
  EMPLOYEE: "employee",
  EXTERNAL_SHIPPER: "external_shipper",
};

export const TRANSPORTS = {
  ROAD: "road",
  FLY: "fly",
};

export const PointConfig = {
  VALUE: 1000,
};

export const MoneyPayThreePls = {
  VALUE: 20000,
};

export const ErrorGHTK = {
  ERRORAPI: "Lỗi tích hợp API",
  WAITTING: "Đang xử lý",
};

// DRAFT("draft", "Nháp"), //Đặt hàng
//   FINALIZED("finalized", "Đã xác nhận"), //Xác nhận
//   DRAFTPO("draftpo", "Phiếu nháp"), //Phiếu nháp
//   STORED("stored", "Đã nhập kho"),  //Nhập kho
//   COMPLETED("completed", "Đã hoàn thành"), //Hoàn thành
//   FINISHED("finished", "Đã kết thúc"), //Kết thúc
//   CANCELLED("cancelled", "Đã hủy"); //Hủy
export const POStatus = {
  //Nháp
  DRAFT: "draft",
  //Đã xác nhận po
  FINALIZED: "finalized",
  // Đã hoàn thành
  COMPLETED: "completed",
  //Đã kết thúc
  FINISHED: "finished",
  //Đã hủy
  CANCELLED: "cancelled",
  //Phiếu nháp
  DRAFTPO: "draftpo",
  //Đã nhập kho
  STORED: "stored",
  STOCK_IN: "stock_in",
};

export const ProcumentStatus = {
  DRAFT: "draft",
  NOT_RECEIVED: "not_received",
  PARTIAL_RECEIVED: "partial_received",
  RECEIVED: "received",
  FINISHED: "finished",
  CANCELLED: "cancelled",
};

export const PoPaymentStatus = {
  DRAFT: "draft",
  UNPAID: "unpaid",
  PAID: "paid",
  PARTIAL_PAID: "partial_paid",
  REFUND: "refund",
  FINISHED: "finished",
  CANCELLED: "cancelled",
};

export const PoPaymentMethod = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
};

export const MODAL_ACTION_TYPE = {
  create: "create",
  edit: "edit",
  delete: "delete",
};

export const PoFinancialStatus = {
  DRAFT: "draft",
  UNPAID: "unpaid",
  PARTIAL_PAID: "partial_paid",
  PAID: "paid",
  FINISHED: "finished",
  CANCELLED: "cancelled",
};

export const DEFAULT_COMPANY = {
  company: "YODY",
  company_id: 1,
};

export const OFFSET_HEADER_UNDER_NAVBAR = 55; //pixels
export const OFFSET_HEADER_TABLE = OFFSET_HEADER_UNDER_NAVBAR + 54; //pixels

export const ProcurementStatus = {
  draft: "draft",
  not_received: "not_received",
  received: "received",
};

export const ProcurementStatusName = {
  [ProcurementStatus.draft]: "Nháp",
  [ProcurementStatus.not_received]: "Đã duyệt",
  [ProcurementStatus.received]: "Đã nhận",
};

export const PROMO_TYPE = {
  MANUAL: "MANUAL",
  AUTOMATIC: "AUTOMATIC",
};

export const COD = {
  code: "cod"
};

export const ADMIN_ORDER = {
	channel_id: 13,
  channel_code: "admin"
};

export const POS = {
	channel_id: 1,
  channel_code: "POS"
};

export const SHOPEE = {
	channel_id: 3,
  channel_code: "Shopee"
};

export const FACEBOOK = {
	channel_id: 2,
  channel_code: "FB"
};

export const SHIPPING_REQUIREMENT = {
  default: "open_try"
};

export const FILTER_CONFIG_TYPE = {
  FILTER_PO: "filter_po",
  FILTER_INVENTORY:  "filter_inventory"
};

export const COLUMN_CONFIG_TYPE = {
  COLUMN_INVENTORY: "column_inventory",
  COLUMN_PO:  "column_po"
};