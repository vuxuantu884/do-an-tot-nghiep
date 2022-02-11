export const AppConfig = {
  baseUrl: process.env.REACT_APP_BASE_URL || "http://localhost:3004",
  timeOut: process.env.REACT_APP_TIME_OUT
    ? parseInt(process.env.REACT_APP_TIME_OUT)
    : 20000,
  production: process.env.REACT_APP_PRODUCTION,
  ydPageUrl: process.env.REACT_APP_YDPAGE_URL,
  currency: "VNĐ",
  price_type: "retail_price",
  import_price: "import_price",
  channel_id: 1,
  DEFAULT_PAYMENT: 1,
  WIN_DEPARTMENT: process.env.REACT_APP_WIN_DEPARTMENT ? parseInt(process.env.REACT_APP_WIN_DEPARTMENT): 0,
  KD_DEPARTMENT_CODE: "KD",
  KDO_DEPARTMENT_CODE: "KDO",
  WM_DEPARTMENT: process.env.REACT_APP_WIN_DEPARTMENT ? parseInt(process.env.REACT_APP_WIN_DEPARTMENT): 0,
  BUSINESS_DEPARTMENT: process.env.REACT_APP_BUSINESS_DEPARTMENT ? parseInt(process.env.REACT_APP_BUSINESS_DEPARTMENT): 0,
  RD_DEPARTMENT: process.env.REACT_APP_RD_DEPARTMENT ? parseInt(process.env.REACT_APP_RD_DEPARTMENT): 0,
  FASHION_INDUSTRY: "fashion",
  CONTENT_SERVICE: process.env.REACT_APP_CONTENT_SERVICE,
  PRODUCT_SERVICE: process.env.REACT_APP_PRODUCT_SERVICE,
  CORE_SERVICE: process.env.REACT_APP_CORE_SERVICE,
  ACCOUNT_SERVICE: process.env.REACT_APP_ACCOUNTS_SERVICE,
  ORDER_SERVICE: process.env.REACT_APP_ORDER_SERVICE,
  CUSTOMER_SERVICE: process.env.REACT_APP_CUSTOMER_SERVICE,
  AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE,
  PURCHASE_ORDER_SERVICE: process.env.REACT_APP_PURCHASE_ORDER_SERVICE,
  IMPORT_EXPORT_SERVICE: process.env.REACT_APP_IMPORT_EXPORT_SERVICE,
  INVENTORY_SERVICE: process.env.REACT_APP_INVENTORY_SERVICE,
  INVENTORY_TRANSFER_SERVICE: process.env.REACT_APP_INVENTORY_TRANSFER_SERVICE,
  LOYALTY_SERVICE: process.env.REACT_APP_LOYALTY_SERVICE,
  ECOMMERCE_SERVICE: process.env.REACT_APP_ECOMMERCE_SERVICE,
  LOGISTIC_GATEWAY_SERVICE: process.env.REACT_APP_LOGISTIC_GATEWAY_SERVICE,
  INVENTORY_ADJUSTMENT_SERVICE: process.env.REACT_APP_INVENTORY_ADJUSTMENT_SERVICE,
  PROMOTION_SERVICE: process.env.REACT_APP_PROMOTION_SERVICE,
  PROMOTION_FIXED_PRICE_TEMPLATE_URL: `${process.env.REACT_APP_CDN}${process.env.REACT_APP_PROMOTION_FIXED_PRICE_TEMPLATE_URL}`,
  PROMOTION_QUANTITY_TEMPLATE_URL: `${process.env.REACT_APP_CDN}${process.env.REACT_APP_PROMOTION_QUANTITY_TEMPLATE_URL}`,
  DISCOUNT_CODES_TEMPLATE_URL:
    process.env.REACT_APP_PROMOTIONS_DISCOUNT_CODES_TEMPLATE_URL,
  PROCUMENT_IMPORT_TEMPLATE_URL: process.env.REACT_APP_PROCUMENT_IMPORT_TEMPLATE_URL,
  PO_EXPORT_TEMPLATE_URL: process.env.REACT_APP_PO_EXPORT_TEMPLATE_URL,
  PO_EXPORT_URL: process.env.REACT_APP_PO_EXPORT_URL,
  PO_STORE_DEFAULT: 144,
  /**
   * @description: thời gian time out khi sử dụng typing request
   * sau khi dừng gõ 500ms thì mới gửi request  => hạn chế request tới server liên tục
   */
  TYPING_TIME_REQUEST: 500,
};
