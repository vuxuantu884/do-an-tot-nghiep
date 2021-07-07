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
  EXCLUSIVE: "exclusive"
}

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