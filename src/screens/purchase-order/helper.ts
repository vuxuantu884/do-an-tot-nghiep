import UrlConfig from "config/url.config";

export const PrintTypePo = {
  PURCHASE_ORDER: "ncc",
  PURCHASE_ORDER_FGG: "fgg",
};

export const ActionPOPrintType = {
  FGG: 1, //mẫu in fgg
  NORMAL: 2, //mẫu in thông thường
};

export const PurchaseOrderTabUrl = {
  LIST: UrlConfig.PURCHASE_ORDERS,
  RETURN: UrlConfig.PURCHASE_ORDERS + "/returns",
};
