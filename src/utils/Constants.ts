export const VietNamId = 233;
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
  DELIVERPARNER: 1,
  SELFDELIVER: 2,
  PICKATSTORE: 3,
  DELIVERLATER: 4,
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

export const POStatus = {
  DRAFT: "draft",
  FINALIZED: "finalized",
  COMPLETED: "completed",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  PROCUREMENT_DRAFT: "procurement_draft",
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
  FINISHED: "finished",
  CANCELLED: "cancelled",
};

export const PoPaymentMethod = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
};
