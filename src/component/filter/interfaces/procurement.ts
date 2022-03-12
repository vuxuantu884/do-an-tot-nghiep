export enum ProcurementFilterAdvanceEnum {
  active = "active",
  expect_receipt = "expect_receipt",
  stock_in = "stock_in",
  stores = "stores",
  status = "status",
}
export enum ProcurementFilterBasicEnum {
  content = "content",
  suppliers = "suppliers",
  merchandisers = "merchandisers",
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
  [ProcurementFilterBasicEnum.merchandisers]: "Merchandiser",
};

export const ProcurementFilterAdvanceName = {
  [ProcurementFilterAdvanceEnum.active]: "Ngày duyệt phiếu nhập",
  [ProcurementFilterAdvanceEnum.stock_in]: "Ngày nhập kho",
  [ProcurementFilterAdvanceEnum.status]: "Trạng thái phiếu nhập kho",
  [ProcurementFilterAdvanceEnum.stores]: "Kho nhận hàng",
  [ProcurementFilterAdvanceEnum.expect_receipt]: "Ngày nhận dự kiến",
};


export interface ProcurementFilterProps{
  onClickOpen?: () => void;
  paramsUrl?: any;
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
