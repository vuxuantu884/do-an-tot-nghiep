export const AppConfig = {
  ENV: process.env.REACT_APP_ENVIRONMENT, // DEV,UAT,PROD
  runMode: process.env.NODE_ENV, // development (npm start), production (npm run build), test (npm run test)
  baseUrl: process.env.REACT_APP_BASE_URL || "http://localhost:3004",
  baseApi: process.env.REACT_APP_BASE_API,
  timeOut: process.env.REACT_APP_TIME_OUT ? parseInt(process.env.REACT_APP_TIME_OUT) : 20000,
  ydPageUrl: process.env.REACT_APP_YDPAGE_URL,
  unichatApi: process.env.REACT_APP_UNICHAT_API,
  unichatUrl: process.env.REACT_APP_UNICHAT_URL,
  currency: "VND",
  price_type: "retail_price",
  import_price: "import_price",
  channel_id: 1,
  VARIANT_TYPE_ERROR: 1,
  DEFAULT_PAYMENT: 1,
  ESPECIALLY_VALUE_PO: 1,
  WIN_DEPARTMENT: null,
  KD_DEPARTMENT_CODE: "KD",
  KDO_DEPARTMENT_CODE: "KDO",
  WM_DEPARTMENT: null,
  BUSINESS_DEPARTMENT: null,
  FASHION_INDUSTRY: "fashion",
  CDN: process.env.REACT_APP_CDN,
  AMOUNT_IN_STAMP_ON_ONE_LINE: 3,
  PO_STORE_DEFAULT: 144,
  ONE_HUNDRED_PERCENT: 100,
  /**
   * @description: thời gian time out khi sử dụng typing request
   * sau khi dừng gõ 500ms thì mới gửi request  => hạn chế request tới server liên tục
   */
  TYPING_TIME_REQUEST: 500,
  PROCUMENT_IMPORT_TEMPLATE_URL:
    "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/Mau_file_nhap_kho.xlsx",
  PO_EXPORT_TEMPLATE_URL:
    "https://yody-file.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_3914d806-813b-4978-bff0-7251b350b40f_original.xlsx",
  PO_EXPORT_URL: process.env.REACT_APP_PO_EXPORT_URL,
  PRODUCT_EXPORT_TEMPLATE:
    "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/template_export_product.xlsx",
  // làm tròn
  mathRoundPrecision: {
    percentage: 2, // làm tròn tiền
    amount: 0, // làm tròn phần trăm
  },
};
export const hotlineNumber = "0888 464 258";
export const hotlineCBNumber = "0389503828";
export const STORE_ID_0 = 0;
export const MAX_LENGTH_VALUE_SEARCH = 15;
export const DATE_CURRENT = 1;
export const IP_IGNORE = [
  // "117.0.24.240",
  // "117.0.24.170",
  // "117.0.24.55",
  // "13.251.121.206",
  // "118.70.81.234",
  // "13.214.135.177",
  // "116.96.45.86",
];
