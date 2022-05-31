import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import tiktokIcon from "assets/icon/e-tiktok.svg";

export const ECOMMERCE_CHANNEL = ["shopee", "lazada", "tiki", "sendo"];

export enum EcommerceChannelId {
  SHOPEE = 3,
  LAZADA = 15,
  SENDO = 16,
  TIKI = 17,
}

export const ECOMMERCE_ICON: any = {
  shopee: shopeeIcon,
  lazada: lazadaIcon,
  tiki: tikiIcon,
  tiktok: tiktokIcon,
};

export const ECOMMERCE_ID = {
  SHOPEE: 1,
  LAZADA: 2,
  TIKI: 3,
  SENDO: 4,
};

export const ECOMMERCE_LIST = [
  {
    title: "Sàn Shopee",
    icon: shopeeIcon,
    key: "shopee",
    ecommerce_id: 1,
    channel_id: 3
  },
  {
    title: "Sàn Lazada",
    icon: lazadaIcon,
    key: "lazada",
    ecommerce_id: 2,
    channel_id: 15
  },
  {
    title: "Sàn Tiki",
    icon: tikiIcon,
    key: "tiki",
    ecommerce_id: 3,
    channel_id: 16
  },

  {
    title: "Sàn Tiktok",
    icon: tiktokIcon,
    key: "tiktok",
    ecommerce_id: 4,
    channel_id: 20
  },
];

export const SHOPEE_ORDER_STATUS_LIST = [
  {
    name: "Chờ xác nhận",
    value: "UNPAID",
  },
  {
    name: "Chờ xử lý",
    value: "READY_TO_SHIP",
  },
  {
    name: "Đã xử lý",
    value: "PROCESSED",
  },
  {
    name: "Lấy hàng lại",
    value: "RETRY_SHIP",
  },
  {
    name: "Đang giao",
    value: "SHIPPED",
  },
  {
    name: "Khách nhận hàng",
    value: "TO_CONFIRM_RECEIVE",
  },
  {
    name: "Yêu cầu hủy",
    value: "IN_CANCEL",
  },
  {
    name: "Đã huỷ",
    value: "CANCELLED",
  },
  {
    name: "Trả hàng",
    value: "TO_RETURN",
  },
  {
    name: "Đã giao",
    value: "COMPLETED",
  },
];

export const LAZADA_ORDER_STATUS_LIST = [
  {
    name: "Chưa thanh toán",
    value: "UNPAID",
  },
  {
    name: "Đang xử lý",
    value: "PENDING",
  },
  {
    name: "Chờ đóng gói",
    value: "PACKED",
  },
  {
    name: "Đóng gói lại",
    value: "REPACKED",
  },
  {
    name: "Chờ bàn giao",
    value: "READY_TO_SHIP",
  },
  {
    name: "Đang giao hàng",
    value: "SHIPPED",
  },
  {
    name: "Đã giao hàng",
    value: "DELIVERED",
  },
  {
    name: "Đơn đã hủy",
    value: "CANCELLED",
  },
  {
    name: "Giao hàng thất bại",
    value: "SHIPPED_BACK",
  },
  {
    name: "Đã hoàn hàng",
    value: "SHIPPED_BACK_SUCCESS",
  },
  {
    name: "Trả hàng hoặc hoàn tiền",
    value: "RETURNED",
  },
  {
    name: "Mất hàng",
    value: "LOST_BY_3PL",
  },
  {
    name: "Hỏng hàng",
    value: "DAMAGED_BY_3PL",
  },
];

export const TIKI_ORDER_STATUS_LIST = [
  {
    name: "Đợi thanh toán",
    value: "waiting_payment",
  },
  {
    name: "Đợi thanh toán",
    value: "payment_review",
  },
  {
    name: "Đã thanh toán",
    value: "paid",
  },
  {
    name: "Đang xử lý",
    value: "processing",
  },
  {
    name: "Chờ in",
    value: "queueing",
  },
  {
    name: "Đang đóng gói",
    value: "packaging",
  },
  {
    name: "Đóng gói xong",
    value: "finished_packing",
  },
  {
    name: "Đang lấy hàng",
    value: "picking",
  },
  {
    name: "Đã giữ",
    value: "holded",
  },
  {
    name: "Bàn giao đối tác",
    value: "handover_to_partner",
  },
  {
    name: "Đang vận chuyển",
    value: "shipping",
  },
  {
    name: "Lên kệ",
    value: "ready_to_ship",
  },
  {
    name: "Giao hàng thành công",
    value: "delivered",
  },
  {
    name: "Giao hàng thành công",
    value: "successful_delivery",
  },
  {
    name: "Đã hủy",
    value: "cancelled",
  },
  {
    name: "Kết thúc",
    value: "closed",
  },
  {
    name: "Hoàn tất",
    value: "complete",
  },
  {
    name: "Đã hoàn",
    value: "returned",
  },
]

export const TIKTOK_ORDER_STATUS_LIST = [
  {
    name: "Chưa thanh toán",
    value: "UNPAID",
  },
  {
    name: "Đang chờ vận chuyển",
    value: "AWAITING_SHIPMENT",
  },
  {
    name: "Đang chờ lấy hàng",
    value: "AWAITING_COLLECTION",
  },
  {
    name: "Đang vận chuyển",
    value: "IN_TRANSIT",
  },
  {
    name: "Đã giao hàng",
    value: "DELIVERED",
  },
  {
    name: "Đã hoàn thành",
    value: "COMPLETED",
  },
  {
    name: "Đã hủy",
    value: "CANCELLED",
  },
];

export const getEcommerceIcon = (ecommerce_key: string) => {
  const ecommerce = ECOMMERCE_LIST.find(
    (item) => item.key.toLowerCase() === ecommerce_key?.toLowerCase()
  );
  return ecommerce?.icon;
};

export const getIconByEcommerceId = (ecommerce_id: number) => {
  const ecommerce = ECOMMERCE_LIST.find((item) => item.ecommerce_id === ecommerce_id);
  return ecommerce?.icon;
};

export const getEcommerceIdByChannelId = (channel_id: number) => {
  const ecommerce = ECOMMERCE_LIST.find(item => item.channel_id.toString() === channel_id.toString());
  return ecommerce?.ecommerce_id;
};

export const getEcommerceIdByChannelCode = (channel_code: string) => {
  const ecommerce = ECOMMERCE_LIST.find(item => item.key === channel_code?.toLowerCase());
  return ecommerce?.ecommerce_id;
}
