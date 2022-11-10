const ImportStatuses = {
  READING: "reading",
  PROCESSING: "processing",
  FINISH: "finish",
  ERROR: "error"
};

const EXCEL_FILE_TYPE_XLS = "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_327a5d28-35ad-4bd1-a78f-1a7e34a53645_original.xls";
const EXCEL_FILE_TYPE_XLSX = "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_d51d5a2c-0470-4ff4-854b-afa19e709ff9_original.xlsx";

export {
  EXCEL_FILE_TYPE_XLS,
  EXCEL_FILE_TYPE_XLSX,
  ImportStatuses
}