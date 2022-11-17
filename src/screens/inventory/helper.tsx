import { showWarning } from "utils/ToastUtils";
import { Upload } from "antd";

const ImportStatuses = {
  READING: "reading",
  PROCESSING: "processing",
  FINISH: "finish",
  ERROR: "error"
};

const EXCEL_FILE_TYPE_XLS = "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_327a5d28-35ad-4bd1-a78f-1a7e34a53645_original.xls";
const EXCEL_FILE_TYPE_XLSX = "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_d51d5a2c-0470-4ff4-854b-afa19e709ff9_original.xlsx";

const beforeUploadFile = (file: any) => {
  const isExcelFile =
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";
  if (!isExcelFile) {
    showWarning("Vui lòng chọn đúng định dạng file excel .xlsx .xls");
    return Upload.LIST_IGNORE;
  } else {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      showWarning("Cần chọn ảnh nhỏ hơn 5mb");
    }
    return isExcelFile && isLt5M;
  }
};

export {
  EXCEL_FILE_TYPE_XLS,
  EXCEL_FILE_TYPE_XLSX,
  ImportStatuses,
  beforeUploadFile
}