import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

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
  sendo: sendoIcon,
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
    title: "Sàn Sendo",
    icon: sendoIcon,
    key: "sendo",
    isActive: false,
    ecommerce_id: 4,
    channel_id: 17
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
  const ecommerce = ECOMMERCE_LIST.find(item => item.key === channel_code);
  return ecommerce?.ecommerce_id;
}
