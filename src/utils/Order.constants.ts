import { FulFillmentStatus } from "./Constants";

export const ORDER_TYPES = {
  online: "online",
  offline: "offline",
} as const;

export const DELIVER_SERVICE_STATUS = {
  active: "active",
  inactive: "inactive",
};

export const RETURN_MONEY_TYPE = {
  return_later: "return_later",
  return_now: "return_now",
};

export const DISCOUNT_VALUE_TYPE = {
  percentage: "PERCENTAGE",
  fixedAmount: "FIXED_AMOUNT",
  fixedPrice: "FIXED_PRICE",
};

export const RETURN_TYPE_VALUES = {
  online: "ONLINE",
  offline: "OFFLINE",
};

export const RETURN_TYPES = [
  {
    name: "Trả lại chuyển hàng",
    value: RETURN_TYPE_VALUES.online,
  },
  {
    name: "Trả lại tại quầy",
    value: RETURN_TYPE_VALUES.offline,
  },
];

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
  confirm_returned: "confirm_returned",
  customer_confirming: "customer_confirming",
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

export const FulfillmentCancelStatus = [
  FulFillmentStatus.RETURNED,
  FulFillmentStatus.RETURNING,
  FulFillmentStatus.CANCELLED,
];

export const ORDER_PAYMENT_STATUS = {
  paid: "paid", // đã trả
  unpaid: "unpaid", // chưa trả
  partial_paid: "partial_paid", // thanh toán một phần
  cancelled: "cancelled", // hủy
  expired: "expired", // hết hạn
  failure: "failure", // thất bại
};

export const ORDER_EXPORT_TYPE = {
  ECOMMERCE: "ecommerce_orders",
  orders_online: "orders_online",
  orders_offline: "orders_offline",
  returns: "returns",
};
export const OrderStatus = {
  DRAFT: "draft",
  FINALIZED: "finalized",
  COMPLETED: "completed",
  FINISHED: "finished",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  SHIPING: "shipping",
  PACKED: "packed",
  getName: (status: string) => {
    switch (status) {
      case OrderStatus.DRAFT:
        return "Nháp";
      case OrderStatus.FINALIZED:
        return "Đã xác nhận";
      case OrderStatus.COMPLETED:
        return "Hoàn thành";
      case OrderStatus.FINISHED:
        return "Kết thúc";
      case OrderStatus.CANCELLED:
        return "Đã huỷ";
      case OrderStatus.EXPIRED:
        return "Đã hết hạn";
      case OrderStatus.SHIPING:
        return "Xuất kho";
      case OrderStatus.PACKED:
        return "Đóng gói";
    }
  },
  getAll: () => {
    return [
      OrderStatus.DRAFT,
      OrderStatus.FINALIZED,
      OrderStatus.COMPLETED,
      OrderStatus.FINISHED,
      OrderStatus.CANCELLED,
      OrderStatus.EXPIRED,
      OrderStatus.SHIPING,
      OrderStatus.PACKED,
    ];
  },
  getClassName: (status: string) => {
    switch (status) {
      case OrderStatus.DRAFT:
        return "gray-status";
      case OrderStatus.PACKED:
        return "blue-status";
      case OrderStatus.SHIPING:
        return "blue-status";
      case OrderStatus.FINALIZED:
        return "blue-status";
      case OrderStatus.COMPLETED:
        return "green-status";
      case OrderStatus.FINISHED:
        return "green-status";
      case OrderStatus.CANCELLED:
        return "red-status";
      case OrderStatus.EXPIRED:
        return "red-status";
      default:
        return "";
    }
  },
};

export const PAYMENT_METHOD_ENUM = {
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
    name: "Chuyển khoản",
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
};

export const FULFILLMENT_PUSHING_STATUS = {
  failed: "failed",
  waiting: "waiting",
  completed: "completed",
};

export const THIRD_PARTY_LOGISTICS_INTEGRATION = {
  ghtk: {
    name: "Giao hàng tiết kiệm",
    code: "ghtk",
    guideUrl: "",
  },
  vtp: {
    name: "Viettel Post",
    code: "vtp",
    guideUrl: "",
  },
  ghn: {
    name: "Giao hàng nhanh",
    code: "ghn",
    guideUrl: "",
  },
  dhl: {
    name: "DHL",
    code: "dhl",
    guideUrl: "",
  },
  snappy: {
    name: "Snappy",
    code: "snappy",
    guideUrl: "",
  },
  ube: {
    name: "Unicorn BEST Express",
    code: "ube",
    guideUrl: "",
  },
  vnpost: {
    name: "VN Post",
    code: "vnpost",
    guideUrl: "",
  },
  nhattin: {
    name: "Nhất tín",
    code: "nt",
    guideUrl: "",
  },
};

export const DISPLAYED_ORDER_ACTION_LOGS = [
  {
    code: "create",
    title: "Tạo mới đơn hàng",
  },
  {
    code: "update",
    title: "Cập nhật đơn hàng",
  },
  {
    code: "cancel",
    title: "Sửa đơn hàng",
  },
  {
    code: "delivery_update",
    title: "Hãng vận chuyển cập nhật trạng thái",
  },
  {
    code: "update_status",
    title: "Đổi trạng thái",
  },
  {
    code: "system_update",
    title: "Hệ thống tự cập nhật",
  },
  {
    code: "add_order_goodsreceipt",
    title: "Thêm vào biên bản bàn giao",
  },
  {
    code: "delete_order_goodsreceipt",
    title: "Xóa khỏi biên bản bàn giao",
  },
  {
    code: "print_order",
    title: "In hóa đơn",
  },
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
