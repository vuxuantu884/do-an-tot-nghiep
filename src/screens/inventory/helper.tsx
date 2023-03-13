import { showWarning } from "utils/ToastUtils";
import { Upload } from "antd";
import { InventoryTransferSearchQuery } from "../../model/inventory/transfer";

const ImportStatuses = {
  READING: "reading",
  PROCESSING: "processing",
  FINISH: "finish",
  ERROR: "error",
};

const VARIANT_STATUS = {
  ACTIVE: "active",
};

const KeyEvent = {
  ENTER: "Enter",
  CONTROL: "Control"
}

const MINIMUM_QUANTITY= 0;
const MAXIMUM_QUANTITY_LENGTH = 6;

const EXCEL_FILE_TYPE_XLS =
  "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_327a5d28-35ad-4bd1-a78f-1a7e34a53645_original.xls";
const EXCEL_FILE_TYPE_XLSX =
  "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_d51d5a2c-0470-4ff4-854b-afa19e709ff9_original.xlsx";

enum InventoryTransferPendingStatus {
  EXCESS = "excess",
  MISSING = "missing",
}

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

const initQuery: InventoryTransferSearchQuery = {
  page: 1,
  limit: 30,
  simple: true,
  condition: null,
  from_store_id: [],
  to_store_id: [],
  status: [],
  note: null,
  created_by: [],
  received_by: [],
  cancel_by: [],
  transfer_by: [],
  from_created_date: null,
  to_created_date: null,
  from_transfer_date: null,
  to_transfer_date: null,
  from_receive_date: null,
  to_receive_date: null,
  from_cancel_date: null,
  to_cancel_date: null,
  from_pending_date: null,
  to_pending_date: null,
};

export {
  MAXIMUM_QUANTITY_LENGTH,
  MINIMUM_QUANTITY,
  EXCEL_FILE_TYPE_XLS,
  EXCEL_FILE_TYPE_XLSX,
  ImportStatuses,
  InventoryTransferPendingStatus,
  beforeUploadFile,
  initQuery,
  KeyEvent,
  VARIANT_STATUS
};
