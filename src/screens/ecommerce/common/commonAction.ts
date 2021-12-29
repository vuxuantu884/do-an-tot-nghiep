import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

const ECOMMERCE_ICON: any = {
  shopee: shopeeIcon,
  lazada: lazadaIcon,
  tiki: tikiIcon,
  sendo: sendoIcon,
};

export default ECOMMERCE_ICON;

export const getEcommerceIcon = (ecommerce: any) => {
  switch (ecommerce?.toLowerCase()) {
    case "shopee":
      return ECOMMERCE_ICON.shopee;
    case "lazada":
      return ECOMMERCE_ICON.lazada;
    case "tiki":
      return ECOMMERCE_ICON.tiki;
    case "sendo":
      return ECOMMERCE_ICON.sendo;
    default:
      break;
  }
};

export const ECOMMERCE_LIST = [
  {
    title: "Sàn Shopee",
    icon: shopeeIcon,
    id: "shopee",
    ecommerce_id: 1,
  },
  {
    title: "Sàn Lazada",
    icon: lazadaIcon,
    id: "lazada",
    ecommerce_id: 2,
  },
  {
    title: "Sàn Tiki",
    icon: tikiIcon,
    id: "tiki",
    ecommerce_id: 3,
  },
  {
    title: "Sàn Sendo",
    icon: sendoIcon,
    id: "sendo",
    isActive: false,
    ecommerce_id: 4,
  },
];
