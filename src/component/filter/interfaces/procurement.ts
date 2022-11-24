import { MenuAction } from "component/table/ActionButton";
import { AccountResponse } from "model/account/account.model";

export enum ProcurementFilterAdvanceEnum {
  Active = "active",
  ExpectReceipt = "expect_receipt",
  StockInBys = "stock_in_bys",
  StockIn = "stock_in",
  Merchandisers = "merchandisers",
  Note = "note",
}

export enum ProcurementTodayFilterAdvanceEnum {
  Active = "active",
  Note = "note",
  StockInBys = "stock_in_bys",
  Merchandisers = "merchandisers",
}

export enum ProcurementFilterBasicEnum {
  Content = "content",
  Suppliers = "suppliers",
  StoreIds = "stores",
  Status = "status",
}

export enum SearchProcurementFieldEnum {
  active_from = "active_from",
  active_to = "active_to",
  stock_in_from = "stock_in_from",
  stock_in_to = "stock_in_to",
  expect_receipt_from = "expect_receipt_from",
  expect_receipt_to = "expect_receipt_to",
}

export const ProcurementFilterBasicName = {
  [ProcurementFilterBasicEnum.Content]: "Thông tin tìm kiếm",
  [ProcurementFilterBasicEnum.Suppliers]: "Nhà cung cấp",
  [ProcurementFilterBasicEnum.StoreIds]: "Kho nhận",
  [ProcurementFilterBasicEnum.Status]: "Trạng thái",
};

export const ProcurementFilterAdvanceName = {
  [ProcurementFilterAdvanceEnum.Active]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterAdvanceEnum.StockInBys]: "Người nhập kho",
  [ProcurementFilterAdvanceEnum.StockIn]: "Ngày nhập kho",
  [ProcurementFilterAdvanceEnum.ExpectReceipt]: "Ngày nhận dự kiến",
  [ProcurementFilterAdvanceEnum.Merchandisers]: "Merchandiser",
  [ProcurementFilterAdvanceEnum.Note]: "Ghi chú",
};

export interface ProcurementFilterProps {
  onClickOpen?: () => void;
  paramsUrl?: any;
  accounts?: Array<AccountResponse>;
  actions?: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
}

export interface ProcurementFilter {
  active_from: string;
  active_to: string;
  stock_in_from: string;
  stock_in_to: string;
  expect_receipt_from: string;
  expect_receipt_to: string;
  stockUser: string;
  confirmUser: string;
  status: string;
  cancelDate: string;
  merchandisers: string;
  stores: string;
  suppliers: string;
}

export enum ProcurementItemsFilterAdvanceEnum {
  StockInDate = "stock_in_date",
  StockInBy = "stock_in_by",
  Note = "note",
}

export const ProcurementItemsFilterAdvanceName = {
  [ProcurementItemsFilterAdvanceEnum.StockInDate]: "Ngày nhập kho",
  [ProcurementItemsFilterAdvanceEnum.StockInBy]: "Người nhận",
  [ProcurementItemsFilterAdvanceEnum.Note]: "Ghi chú",
};
