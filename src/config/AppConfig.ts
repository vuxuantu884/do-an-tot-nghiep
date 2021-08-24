export const AppConfig = {
  baseUrl: process.env.REACT_APP_BASE_URL,
  timeOut: process.env.REACT_APP_TIME_OUT
    ? parseInt(process.env.REACT_APP_TIME_OUT)
    : 10000,
  production: process.env.REACT_APP_PRODUCTION,
  currency: "VNĐ",
  price_type: "retail_price",
  import_price: "import_price",
  channel_id: 1,
  DEFAULT_PAYMENT: 1,
  WIN_DEPARTMENT: 4,
  RD_DEPARTMENT: 15,
  CONTENT_SERVICE: process.env.REACT_APP_CONTENT_SERVICE,
  PRODUCT_SERVICE: process.env.REACT_APP_PRODUCT_SERVICE,
  CORE_SERVICE: process.env.REACT_APP_CORE_SERVICE,
  ACCOUNT_SERVICE: process.env.REACT_APP_ACCOUNTS_SERVICE,
  ORDER_SERVICE: process.env.REACT_APP_ORDER_SERVICE,
  CUSTOMER_SERVICE: process.env.REACT_APP_CUSTOMER_SERVICE,
  AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE,
  PURCHASE_ORDER_SERVICE: process.env.REACT_APP_PURCHASE_ORDER_SERVICE,
  IMPORT_EXPORT_SERVICE: process.env.REACT_APP_IMPORT_EXPORT_SERVICE,
};
