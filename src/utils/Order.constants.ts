import { FulFillmentStatus } from "./Constants";

export const ORDER_TYPES = {
  online: "online",
  offline: "offline",
} as const

export const DELIVER_SERVICE_STATUS = {
  active: "active",
  inactive: "inactive",
};

export const RETURN_MONEY_TYPE = {
  return_later: "return_later",
  return_now: "return_now",
};

export const ORDER_RETURN_HISTORY = [
  {
    code: "received",
    title: "Nhận hàng",
  },
  {
    code: "return",
    title: "Trả hàng",
  },
  {
    code: "payment",
    title: "Hoàn tiền",
  },
];

export const DISCOUNT_VALUE_TYPE = {
  percentage: "PERCENTAGE",
  fixedAmount: "FIXED_AMOUNT",
  fixedPrice: "FIXED_PRICE",
}

export const RETURN_TYPE_VALUES = {
  online: "ONLINE",
  offline: "OFFLINE",
}

export const RETURN_TYPES = [
  {
    name: "Trả lại chuyển hàng",
    value: RETURN_TYPE_VALUES.online
  },
  {
    name: "Trả lại tại quầy",
    value: RETURN_TYPE_VALUES.offline
  }
] 

export const ORDER_SUB_STATUS = {
  first_call_attempt: "first_call_attempt",
  second_call_attempt: "second_call_attempt",
  third_call_attempt: "third_call_attempt",
  awaiting_coordinator_confirmation: "awaiting_coordinator_confirmation",
  awaiting_saler_confirmation: "awaiting_saler_confirmation",
  coordinator_confirmed: "coordinator_confirmed",
  merchandise_picking: "merchandise_picking",
  require_warehouse_change: "require_warehouse_change",
  merchandise_packed: "merchandise_packed",
  awaiting_shipper: "awaiting_shipper",
  shipping: "shipping",
  shipped: "shipped",
  canceled: "canceled",
  fourHour_delivery: "4h_delivery",
  order_return: "order_return",
  returning: "returning",
  returned: "returned",
  customer_cancelled: "customer_cancelled",
  system_cancelled: "system_cancelled",
  delivery_service_cancelled: "delivery_service_cancelled",
  compensate: "compensate",
  delivery_fail: "delivery_fail",
  change_depot: "change_depot",
  out_of_stock: "out_of_stock",
  coordinator_confirming: "coordinator_confirming",
};

export const SUB_STATUS_CANCEL_CODE = [
  ORDER_SUB_STATUS.customer_cancelled,
  ORDER_SUB_STATUS.system_cancelled,
  ORDER_SUB_STATUS.delivery_service_cancelled,
];


export const ORDER_RETURN_SUB_STATUS = {
  returning: {
    code: "returning",
  },
  returned: {
    code: "returned",
  },
};

export const FulfillmentCancelStatus = [FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING, FulFillmentStatus.CANCELLED];

export const ORDER_PAYMENT_STATUS = {
  paid: "paid", // đã trả
  unpaid: "unpaid", // chưa trả
  partial_paid: "partial_paid", // thanh toán một phần
}

export const ORDER_EXPORT_TYPE = {
  ECOMMERCE: "ecommerce_orders",
  orders_online: "orders_online",
  orders_offline: "orders_offline",
  returns: "returns",
}

export const  PAYMENT_METHOD_ENUM = {
  cod: {
    id: 0,
    code: "cod",
    name: "COD",
  },
  point: {
    id: 1,
    code: "point",
    name: "Tiêu điểm",
  },
  cash: {
    id: 2,
    code: "cash",
    name: "Tiền mặt",
  },
  bankTransfer: {
    id: 3,
    code: "bank_transfer",
    name: "Chuyển khoản"
  },
  qrPay: {
    id: 4,
    code: "qr_pay",
    name: "QR",
  },
  card: {
    id: 6,
    code: "card",
    name: "Quẹt thẻ",
  },
  exchange: {
    id: 0,
    code: "exchange",
    name: "Hàng đổi",
  },
  pointRefund: {
    id: 0,
    code: "point_refund",
    name: "Hoàn điểm",
  },
}