import {
  WarrantyFinancialStatus,
  WarrantyItemStatus,
  WarrantyItemTypeModel,
  WarrantyProductStatusStatusModel,
  WarrantyProductStatusTypeModel,
  WarrantyReasonStatusModel,
  WarrantyReturnStatusModel,
} from "model/warranty/warranty.model";

export const WARRANTY_TYPE = [
  {
    code: WarrantyItemTypeModel.WARRANTY,
    name: "Bảo hành",
  },
  {
    code: WarrantyItemTypeModel.REPAIR,
    name: "Sửa chữa",
  },
];

export const WARRANTY_ITEM_STATUS = [
  {
    code: WarrantyItemStatus.RECEIVED,
    name: "Mới tiếp nhận",
    type: "success",
  },
  {
    code: WarrantyItemStatus.FIXING,
    name: "Đang sửa",
    type: "success",
  },
  {
    code: WarrantyItemStatus.FIXED,
    name: "Đã sửa",
    type: "success",
  },
  {
    code: WarrantyItemStatus.NOT_FIXED,
    name: "Không thể sửa",
    type: "danger",
  },
];

export const WARRANTY_FINANCIAL_STATUS = [
  {
    code: WarrantyFinancialStatus.PAID,
    name: "Chưa thanh toán",
  },
  {
    code: WarrantyFinancialStatus.UNPAID,
    name: "Đã thanh toán",
  },
];

export const WARRANTY_RETURN_STATUS = [
  {
    code: WarrantyReturnStatusModel.UNRETURNED,
    name: "Chưa trả khách",
    type: "danger",
  },
  {
    code: WarrantyReturnStatusModel.RETURNED,
    name: "Đã trả khách",
    type: "success",
  },
];

export const WARRANTY_REASON_STATUS = [
  {
    code: WarrantyReasonStatusModel.ACTIVE,
    name: "Hoạt động",
  },
  {
    code: WarrantyReasonStatusModel.INACTIVE,
    name: "Chưa hoạt động",
  },
];

export const WARRANTY_PRODUCT_STATUS_STATUS = [
  {
    code: WarrantyProductStatusStatusModel.ACTIVE,
    name: "Hoạt động",
  },
  {
    code: WarrantyProductStatusStatusModel.INACTIVE,
    name: "Chưa hoạt động",
  },
];

export const WARRANTY_PRODUCT_STATUS_TYPE = [
  {
    code: WarrantyProductStatusTypeModel.WARRANTY,
    name: "Trạng thái phiếu bảo hành",
  },
  {
    code: WarrantyProductStatusTypeModel.PRODUCT,
    name: "Trạng thái sản phẩm",
  },
];
