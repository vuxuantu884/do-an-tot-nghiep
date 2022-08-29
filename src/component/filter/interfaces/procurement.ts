import { MenuAction } from "component/table/ActionButton";
import { AccountResponse } from "model/account/account.model";

export enum ProcurementFilterAdvanceEnum {
  active = "active",
  expect_receipt = "expect_receipt",
  stock_in_bys = "stock_in_bys",
  stock_in = "stock_in",
  merchandisers = "merchandisers",
  note = "note",
}

export enum ProcurementTodayFilterAdvanceEnum {
  active = "active",
  note = "note",
  stock_in_bys = "stock_in_bys",
  merchandisers = "merchandisers",
}

export enum ProcurementFilterBasicEnum {
  content = "content",
  suppliers = "suppliers",
  store_ids = "stores",
  status = "status",
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
  [ProcurementFilterBasicEnum.content]: "Thông tin tìm kiếm",
  [ProcurementFilterBasicEnum.suppliers]: "Nhà cung cấp",
  [ProcurementFilterBasicEnum.store_ids]: "Kho nhận",
  [ProcurementFilterBasicEnum.status]: "Trạng thái",
};

export const ProcurementFilterAdvanceName = {
  [ProcurementFilterAdvanceEnum.active]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterAdvanceEnum.stock_in_bys]: "Người nhập kho",
  [ProcurementFilterAdvanceEnum.stock_in]: "Ngày nhập kho",
  [ProcurementFilterAdvanceEnum.expect_receipt]: "Ngày nhận dự kiến",
  [ProcurementFilterAdvanceEnum.merchandisers]: "Merchandiser",
  [ProcurementFilterAdvanceEnum.note]: "Ghi chú",
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
  stock_in_date = "stock_in_date",
  stock_in_by = "stock_in_by",
  note = "note",
}

export const ProcurementItemsFilterAdvanceName = {
  [ProcurementItemsFilterAdvanceEnum.stock_in_date]: "Ngày nhập kho",
  [ProcurementItemsFilterAdvanceEnum.stock_in_by]: "Người nhận",
  [ProcurementItemsFilterAdvanceEnum.note]: "Ghi chú",
};
