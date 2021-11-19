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

export const DEFAULT_CHANNEL_ID = 13; //đang fix cứng admin

export const  DISCOUNT_VALUE_TYPE = {
  percentage: "PERCENTAGE",
  fixedAmount: "FIXED_AMOUNT",
  fixedPrice: "FIXED_PRICE",
}