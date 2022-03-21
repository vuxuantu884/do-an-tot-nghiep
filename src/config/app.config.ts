export const AppConfig = {
  ENV: process.env.REACT_APP_ENVIRONMENT, // DEV,UAT,PROD
  runMode: process.env.NODE_ENV, // development (npm start), production (npm run build), test (npm run test)
  baseUrl: process.env.REACT_APP_BASE_URL || "http://localhost:3004",
  baseApi: process.env.REACT_APP_BASE_API,
  timeOut: process.env.REACT_APP_TIME_OUT ? parseInt(process.env.REACT_APP_TIME_OUT) : 20000,
  ydPageUrl: process.env.REACT_APP_YDPAGE_URL,
  currency: "VNĐ",
  price_type: "retail_price",
  import_price: "import_price",
  channel_id: 1,
  DEFAULT_PAYMENT: 1,
  WIN_DEPARTMENT: null,
  KD_DEPARTMENT_CODE: "KD",
  KDO_DEPARTMENT_CODE: "KDO",
  WM_DEPARTMENT: null,
  BUSINESS_DEPARTMENT: null,
  FASHION_INDUSTRY: "fashion",
  CDN: process.env.REACT_APP_CDN,

  PO_STORE_DEFAULT: 144,
  /**
   * @description: thời gian time out khi sử dụng typing request
   * sau khi dừng gõ 500ms thì mới gửi request  => hạn chế request tới server liên tục
   */
  TYPING_TIME_REQUEST: 500,
  PROCUMENT_IMPORT_TEMPLATE_URL: "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/Mau_file_nhap_kho.xlsx",
  PO_EXPORT_TEMPLATE_URL: "https://yody-file.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_3914d806-813b-4978-bff0-7251b350b40f_original.xlsx",
  PO_EXPORT_URL: process.env.REACT_APP_PO_EXPORT_URL,
  PRODUCT_EXPORT_TEMPLATE: "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/template_export_product.xlsx"
};
