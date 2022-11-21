import { AppConfig } from "config/app.config";
import { AccountStoreResponse } from "model/account/account.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import { formatCurrency } from "utils/AppUtils";

enum ProcurementStatus {
  DRAFT = "draft",
  NOT_RECEIVED = "not_received",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

const ProcurementStatusName: any = {
  [ProcurementStatus.DRAFT]: "Nháp",
  [ProcurementStatus.NOT_RECEIVED]: "Đã duyệt",
  [ProcurementStatus.RECEIVED]: "Đã nhận",
  [ProcurementStatus.CANCELLED]: "Đã hủy",
};

const POProcurementField = {
  id: "id",
  code: "code",
  reference: "reference",
  store_id: "store_id",
  store: "store",
  expect_receipt_date: "expect_receipt_date",
  procurement_items: "procurement_items",
  status: "status",
  note: "note",
  activated_date: "activated_date",
  activated_by: "activated_by",
  stock_in_date: "stock_in_date",
  stock_in_by: "stock_in_by",
  supplier_id: "supplier_id",
  supplier: "supplier",
  supplier_phone: "supplier_phone",
  po_code: "po_code",
  file: "file",
};

const POProcurementLineItemField = {
  id: "id",
  line_item_id: "line_item_id",
  sku: "sku",
  barcode: "barcode",
  variant: "variant",
  variant_image: "variant_image",
  ordered_quantity: "ordered_quantity",
  accepted_quantity: "accepted_quantity",
  planned_quantity: "planned_quantity",
  quantity: "quantity",
  real_quantity: "real_quantity",
  note: "note",
};

enum EnumActionIndex {
  PRINT_PROCUREMENTS = 1,
  CANCEL = 2,
}

enum EnumTypeExport {
  ALL = "all",
  PAGE = "page",
  SELECTED = "selected",
  ALLIN = "allin",
  ALL_OUT = "all_out",
}

enum EnumImportResponseStatuses {
  FINISH = "FINISH",
  PROCESSING = "PROCESSING",
  ERROR = "ERROR",
}

enum EnumImportStep {
  DEFAULT = 1,
  CHANGE_FILE = 2,
  CREATE_JOB_SUCCESS = 3,
  JOB_FINISH = 4,
  ERROR = 5,
}

enum EnumStoreName {
  ANH = "YODY KHO TỔNG HT ÁNH",
  TUNG = "YODY KHO TỔNG HT TÙNG",
  HIEU = "YODY KHO TỔNG MT",
}

const checkStoresEnvironment = () => {
  let stores: Array<Pick<AccountStoreResponse, "store_id" | "store">> = [
    { store_id: 17, store: EnumStoreName.ANH },
    { store_id: 16, store: EnumStoreName.TUNG },
    { store_id: 19, store: EnumStoreName.HIEU },
  ];
  if (AppConfig.ENV === "DEV") {
    stores = [
      { store_id: 363, store: EnumStoreName.ANH },
      { store_id: 364, store: EnumStoreName.TUNG },
      { store_id: 365, store: EnumStoreName.HIEU },
    ];
  } else if (AppConfig.ENV === "UAT") {
    stores = [
      { store_id: 198, store: EnumStoreName.ANH },
      { store_id: 197, store: EnumStoreName.TUNG },
      { store_id: 200, store: EnumStoreName.HIEU },
    ];
  }
  return stores;
};

const LogsStatus = [
  { key: "draft", value: "Nháp" },
  { key: "not_received", value: "Chưa nhận hàng" },
  { key: "partial_received", value: "Nhận hàng một phần" },
  { key: "received", value: "Đã nhận hàng" },
  { key: "finished", value: "Đã kết thúc" },
  { key: "cancelled", value: "Đã hủy" },
];

const getTotalProcurementItemsQuantityType = (
  procurementItems: Array<PurchaseProcumentLineItem>,
  prQuantityType: string,
): number => {
  let totalQuantity = 0;
  procurementItems.forEach((item: PurchaseProcumentLineItem) => {
    totalQuantity += item[prQuantityType];
  });
  return totalQuantity;
};

const getTotalProcurementItems = (procurements: Array<PurchaseProcument>) => {
  let total = 0;
  procurements.forEach((element: PurchaseProcument) => {
    if (!element.procurement_items.length) element.procurement_items.length = 0;
    total += element.procurement_items.length;
  });
  return formatCurrency(total);
};

const getTotalProcurementQuantity = (
  procurements: Array<PurchaseProcument>,
  quantityType: string,
): string => {
  let total = 0;
  procurements.forEach((element: PurchaseProcument) => {
    element.procurement_items.forEach((item: PurchaseProcumentLineItem) => {
      total += item[quantityType];
    });
  });

  return formatCurrency(total);
};

export {
  ProcurementStatus,
  ProcurementStatusName,
  POProcurementField,
  POProcurementLineItemField,
  EnumActionIndex,
  EnumTypeExport,
  EnumImportResponseStatuses,
  EnumImportStep,
  EnumStoreName,
  LogsStatus,
  getTotalProcurementItemsQuantityType,
  getTotalProcurementItems,
  getTotalProcurementQuantity,
  checkStoresEnvironment,
};
