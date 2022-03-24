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
