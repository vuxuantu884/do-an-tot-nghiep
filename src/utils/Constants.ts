export const VietNamId = 233;
export const VietNamName = "Việt Nam";
export const ConAcceptImport = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
// export const PO_FORM_TEMPORARY = 'po-form-temporary';

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
  COD: "cod",
  EXCHANGE: "exchange",
  POINT_REFUND: "point_refund",
  MOMO: "momo",
  VN_PAY: "vn_pay",
  VCB_QR: "vcb_qr",
};

export const PaymentMethodType = {
  MOMO: "momo",
  VN_PAY: "vn_pay",
  VCB_QR: "vcb_qr",
};

export const OrderStatus = {
  DRAFT: "draft", // đơn nháp
  FINALIZED: "finalized", //đơn đã duyệt
  COMPLETED: "completed",
  FINISHED: "finished", // đơn hàng Đã kết thúc (đơn thành công)
  CANCELLED: "cancelled", //đơn hàng đã hủy
  EXPIRED: "expired",
};

export const ArrPoStatus = [
  { key: "draft", value: "Nháp" },
  { key: "waiting_approval", value: "Chờ duyệt" },
  { key: "finalized", value: "Đã duyệt" },
  { key: "stored", value: "Nhập kho" },
  { key: "completed", value: "Hoàn thành" },
  { key: "finished", value: "Đã kết thúc" },
  { key: "cancelled", value: "Đã hủy" },
];

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
  UNRETURNED: "unreturned",
};

export const FulFillmentReturnStatus = {
  RETURNING: "returning",
  RETURNED: "returned",
};

export const DISCOUNT_TYPE = {
  MONEY: "money",
  PERCENT: "percent",
  COUPON: " coupon",
};

export const PaymentMethodOption = {
  COD: 1,
  PRE_PAYMENT: 2,
  POST_PAYMENT: 3,
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
  SHOPEE: "shopee",
};

export const SHIPPING_TYPE = {
  DELIVERY_4H: "4h_delivery",
  ROAD: "road",
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

export const POStatus = {
  //Nháp
  DRAFT: "draft",
  //Chờ duyệt
  WAITING_APPROVAL: "waiting_approval",
  //Đã duyệt
  FINALIZED: "finalized",
  //Đã nhập kho
  STORED: "stored",
  // Đã hoàn thành
  COMPLETED: "completed",
  //Đã kết thúc
  FINISHED: "finished",
  //Đã hủy
  CANCELLED: "cancelled",
};

export const PO_RETURN_HISTORY = [
  {
    code: "draft",
    title: "Đặt hàng",
  },
  {
    code: "finalized",
    title: "Xác nhận",
  },
  {
    code: "completed",
    title: "Hoàn thành",
  },
  {
    code: "cancelled",
    title: "Đã huỷ",
  },
  {
    code: "finished",
    title: "Kết thúc",
  },
  {
    code: "stored",
    title: "Đã nhập kho",
  },
  {
    code: "stock_in",
    title: "Đã nhập kho",
  },
  {
    code: "draftpo",
    title: "Phiếu nháp",
  },
  {
    code: "null",
    title: "Không có dữ liệu",
  },
  {
    code: "Create",
    title: "Đã tạo",
  },
  {
    code: "waiting_approval",
    title: "Chờ duyệt",
  },
];

export const ProcumentStatus = {
  DRAFT: "draft",
  NOT_RECEIVED: "not_received",
  PARTIAL_RECEIVED: "partial_received",
  RECEIVED: "received",
  FINISHED: "finished",
  CANCELLED: "cancelled",
};

export const TypeModalPo = {
  CONFIRM: "confirm",
  INVENTORY: "inventory",
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

export const TYPE_EXPORT = {
  all: "all",
  page: "page",
  selected: "selected",
  allin: "allin",
  all_out: "all_out",
};

export const OFFSET_HEADER_UNDER_NAVBAR = 50; //pixels
export const OFFSET_HEADER_TABLE = OFFSET_HEADER_UNDER_NAVBAR + 46; //pixels
export const MAX_PAGE_INVENTORY_HISTORY = 10;

export const ProcurementStatus = {
  draft: "draft",
  not_received: "not_received",
  received: "received",
  cancelled: "cancelled",
};

export const ProcurementStatusName = {
  [ProcurementStatus.draft]: "Nháp",
  [ProcurementStatus.not_received]: "Đã duyệt",
  [ProcurementStatus.received]: "Đã nhận",
  [ProcumentStatus.CANCELLED]: "Đã hủy",
};

export const PROMO_TYPE = {
  MANUAL: "MANUAL",
  AUTOMATIC: "AUTOMATIC",
};

export const COD = {
  code: "cod",
};

export const ADMIN_ORDER = {
  channel_id: 13,
  channel_code: "admin",
  channel_name: "ADMIN",
};

export const POS = {
  channel_id: 1,
  channel_code: "POS",
  channel_name: "POS",
  source: "POS",
  source_id: 1,
  source_code: "POS",
  source_name: "POS",
};

export const SHOPEE = {
  channel_id: 3,
  channel_code: "SHOPEE",
};

export const YODY_WEB = {
  channel_id: 4,
  channel_code: "web",
};

export const YODY_APP = {
  channel_id: 5,
  channel_code: "APP",
};

export const YODY_LANDING_PAGE = {
  channel_id: 6,
  channel_code: "LANDING_PAGE",
};

export const TIKI = {
  channel_id: 17,
  channel_code: "TIKI",
};

export const LAZADA = {
  channel_id: 15,
  channel_code: "LAZADA",
};

export const SENDO = {
  channel_id: 16,
  channel_code: "SENDO",
};

export const FACEBOOK = {
  channel_id: 2,
  channel_code: "FB",
};

export const TIKTOK = {
  channel_id: 20,
  channel_code: "TIKTOK",
};

export const WEBSITE = {
  channel_id: 4,
  channel_code: "website",
};

export const ECOMMERCE_CHANNEL_CODES = [
  TIKI.channel_code,
  LAZADA.channel_code,
  SENDO.channel_code,
  SHOPEE.channel_code,
  TIKTOK.channel_code,
];

export const WEB_APP_CHANNEL_CODES = [
  WEBSITE.channel_code,
  YODY_APP.channel_code,
  YODY_LANDING_PAGE.channel_code,
];

// shopee, lazada, tiki, tiktok, website, app, landingpage
export const ECOMMERCE_CHANNEL_CODES_UPDATE_ORDER = [
  SHOPEE,
  LAZADA,
  TIKI,
  TIKTOK,
  WEBSITE,
  YODY_APP,
  YODY_LANDING_PAGE,
];

export const SHIPPING_REQUIREMENT = {
  default: "open_try",
};

export const FILTER_CONFIG_TYPE = {
  FILTER_PO: "filter_po",
  FILTER_INVENTORY: "filter_inventory",
  orderOnline: "filter_order_online",
  orderOffline: "filter_order_offline",
  orderReturnOnline: "filter_order_return_online",
  orderReturnOffline: "filter_order_return_offline",
  FILTER_STOCK_IN_OUT: "filter_stock_in_out",
  FILTER_LIST_CUSTOMER: "filter_list_customer",
};

export enum COLUMN_CONFIG_TYPE {
  COLUMN_INVENTORY = "column_inventory",
  COLUMN_PO = "column_po",
  orderOnline = "column_order_online",
  orderOffline = "column_order_offline",
  orderReturnOnline = "column_order_return_online",
  orderReturnOffline = "column_order_return_offline",
  orderDuplicatedOnline = "column_order_duplicated_online",
  orderDeliveryRecord = "column_order_delivery_record",
  CUSTOMER_COLUMNS = "customer_columns",
  COLUMN_INVENTORY_HISTORY = "column_inventory_history",
  COLUMN_VARIANT = "column_variant",
  COLUMN_PRODUCT = "column_product",
  COLUMN_PRODUCT_HISTORY = "column_product_history",
  COLUMN_PRODUCT_PRICE = "column_product_price",
  COLUMN_INVENTORY_ADJUSTMENT = "column_inventory_adjustment",
  COLUMN_INVENTORY_DEFECT = "column_inventory_defect",
  COLUMN_INVENTORY_DEFECT_HISTORY = "column_inventory_defect_history",
  INVENTORY_DEFECTS = "inventory_defects",
}

export const ACCOUNT_ROLE_ID = {
  admin: 1,
};

export const GENDER_OPTIONS = [
  {
    label: "Nam",
    value: "male",
  },
  {
    label: "Nữ",
    value: "female",
  },
  {
    label: "Khác",
    value: "other",
  },
];

export const ECOMMERCE_JOB_TYPE = {
  STOCK: "stock",
  VARIANT: "variant",
  ORDER: "order",
  IMPORT: "import",
  EXPORT: "export",
  SYNC_VARIANT: "sync-variant",
};

export const LABEL_JOB_TYPE = [
  {
    label: "stock",
    display: "Đồng bộ tồn",
  },
  {
    label: "variant",
    display: "Tải sản phẩm",
  },
  {
    label: "order",
    display: "Tải đơn hàng",
  },
  {
    label: "import",
    display: "Đồng bộ sản phẩm",
  },
  {
    label: "export",
    display: "Xuất sản phẩm",
  },
  {
    label: "sync-variant",
    display: "Đồng bộ sản phẩm",
  },
];

export const getJobType = (type: String) => {
  return LABEL_JOB_TYPE.find((item) => item.label === type);
};

export const PRODUCT_TYPE = {
  normal: "normal",
  combo: "combo",
  gift: "gift",
  service: "service",
};

export const DELIVERY_SERVICE_PROVIDER_CODE = {
  ghtk: "ghtk",
  ghn: "ghn",
  vtp: "vtp",
};

export const STATUS_IMPORT_EXPORT = {
  NONE: 0,
  DEFAULT: 1,
  CREATE_JOB_SUCCESS: 2,
  JOB_FINISH: 3,
  ERROR: 4,
};

export const WEIGHT_UNIT = {
  gram: {
    name: "Gram",
    value: "g",
  },
  kilogram: {
    name: "Kilogram",
    value: "kg",
  },
};

export const STORE_TYPE = {
  STORE: "store", //Cửa hàng & kho
  WARE_HOUSE: "ware_house", //Kho online
  DISTRIBUTION_CENTER: "distribution_center", //Kho phân phối
  STOCKPILE: "stockpile", //Kho dự trữ
};

export const PUSHING_STATUS = {
  COMPLETED: "completed",
};

export const RECEIPT_TYPE = {
  SHIPPING: 1,
  RETURNED: 2,
};

export const REVENUE_STATE = [
  {
    code: "draft",
    name: "Mới",
  },
  {
    code: "paying",
    name: "Chưa nộp tiền",
  },
  {
    code: "paid",
    name: "Đã nộp tiền",
  },
  {
    code: "finished",
    name: "Đã xác nhận",
  },
];

export const DAILY_REVENUE_IMPORT = {
  OTHER_PAYMENT: "other_payment",
  CONFIRM_PAYMENT: "confirm_payment",
};

export const DATE_OPTION_VALUE = {
  today: "today",
  yesterday: "yesterday",
  thisWeek: "thisWeek",
  lastWeek: "lastWeek",
  thisMonth: "thisMonth",
  lastMonth: "lastMonth",
};

export enum EnumConfirmModalType {
  SUCCESS = "success",
  WARNING = "warning",
  INFO = "info",
  ERROR = "error",
}

export enum EnumOrderType {
  b2b = "B2B",
  b2c = "B2C",
}

export const ORDER_TYPES_ONLINE = [
  {
    code: EnumOrderType.b2c,
    name: "Bán lẻ",
  },
  {
    code: EnumOrderType.b2b,
    name: "Bán buôn",
  },
];

export const ANT_PREFIX_CLS = "ant";
