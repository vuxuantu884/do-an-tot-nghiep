import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { utils, writeFile } from "xlsx";
import moment from "moment";
import { IncurredAuditRecordType } from "model/inventoryadjustment";
import { ProductHelper } from "utils";
import UrlConfig from "config/url.config";

const DELAY_TIME_FOR_TOUR = 1000;
const FORMAT_DATE_UPLOAD_FILE = 'hh-mm-ss-DD-MM-YYYY';

const ACTION_CALLBACK = {
  CLOSE: 'close',
  RESET: 'reset'
};

const KEY = {
  ESC: "Escape",
  ENTER: "Enter"
};

const IncurredRecordExportField = {
  code: "Phiếu",
  sku: "SKU",
  quantity: "Thay đổi",
  onHand: "Tồn trong kho",
  transactionDate: "Thời gian"
};

const convertRecordExport = (data: Array<IncurredAuditRecordType>) => {
  return data.map((item) => {
    return {
      [IncurredRecordExportField.code]: item.code,
      [IncurredRecordExportField.sku]: item.sku,
      [IncurredRecordExportField.quantity]: item.quantity,
      [IncurredRecordExportField.onHand]: item.on_hand,
      [IncurredRecordExportField.transactionDate]: ConvertUtcToLocalDate(item.transaction_date, "DD/MM/YYYY HH:mm"),
    }
  });
};

const exportExcel = (data: Array<IncurredAuditRecordType>) => {
  const workbook = utils.book_new();
  const item = convertRecordExport(data);
  const ws = utils.json_to_sheet(item);

  utils.book_append_sheet(workbook, ws, "Hoàn thành kiểm");
  const today = moment(new Date(), "YYYY/MM/DD");
  const month = today.format("M");
  const day = today.format("D");
  const year = today.format("YYYY");
  writeFile(workbook, `Phieu_phat_sinh_${day}_${month}_${year}.xlsx`);
};

const exportExcelTwoSheet = (incurredAuditRecords: Array<IncurredAuditRecordType>, incurredAdjustRecords: Array<IncurredAuditRecordType>) => {
  const workbook = utils.book_new();
  const incurredAuditData = convertRecordExport(incurredAuditRecords);
  const ws = utils.json_to_sheet(incurredAuditData);

  const incurredAdjustData = convertRecordExport(incurredAdjustRecords);
  const ws2 = utils.json_to_sheet(incurredAdjustData);

  utils.book_append_sheet(workbook, ws, "Hoàn thành kiểm");
  utils.book_append_sheet(workbook, ws2, "Cân tồn kho");
  const today = moment(new Date(), "YYYY/MM/DD");
  const month = today.format("M");
  const day = today.format("D");
  const year = today.format("YYYY");
  writeFile(workbook, `Phieu_phat_sinh_${day}_${month}_${year}.xlsx`);
};

const goDocument = (type: string) => {
  switch (type) {
    case ProductHelper.ProductHistoryDocumentTypes.ORDER:
      return UrlConfig.ORDER;
    case ProductHelper.ProductHistoryDocumentTypes.RETURN_ORDER:
      return UrlConfig.ORDERS_RETURN;
    case ProductHelper.ProductHistoryDocumentTypes.PURCHASE_ORDER:
    case ProductHelper.ProductHistoryDocumentTypes.RETURN_PO:
      return UrlConfig.PURCHASE_ORDERS;
    case ProductHelper.ProductHistoryDocumentTypes.INVENTORY_TRANSFER:
      return UrlConfig.INVENTORY_TRANSFERS;
    case ProductHelper.ProductHistoryDocumentTypes.INVENTORY_ADJUSTMENT:
      return UrlConfig.INVENTORY_ADJUSTMENTS;
    case ProductHelper.ProductHistoryDocumentTypes.OTHER_STOCK_IN_OUT:
      return UrlConfig.STOCK_IN_OUT_OTHERS;
    default:
      return type;
  }
}

export {
  DELAY_TIME_FOR_TOUR,
  ACTION_CALLBACK,
  FORMAT_DATE_UPLOAD_FILE,
  convertRecordExport,
  exportExcel,
  exportExcelTwoSheet,
  goDocument,
  KEY
}