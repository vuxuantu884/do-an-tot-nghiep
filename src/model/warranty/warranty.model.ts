import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export enum WarrantyStatus {
  NEW = "NEW",
  FINALIZED = "FINALIZED",
  FINISH = "FINISH",
}

export enum WarrantyFinancialStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
}

export enum WarrantyItemStatus {
  RECEIVED = "RECEIVED",
  FIXING = "FIXING",
  FIXED = "FIXED",
  NOT_FIXED = "NOT_FIXED",
  FINISH = "FINISH",
}

export enum WarrantyReturnStatusModel {
  RETURNED = "RETURNED",
  UNRETURNED = "UNRETURNED",
}

export enum WarrantyItemTypeModel {
  WARRANTY = "WARRANTY",
  REPAIR = "REPAIR",
}

export enum WarrantyProductStatusTypeModel {
  PRODUCT = "PRODUCT",
  WARRANTY = "WARRANTY",
}

export enum WarrantyProductStatusStatusModel {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum WarrantyFormType {
  SHIPPING = "SHIPPING",
  STORE = "STORE",
}

export enum WarrantyReasonStatusModel {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface WarrantyPayment {
  id: number;
  code: string;
  value: number;
  payment_method_id: number;
  payment_method: string;
}

export interface WarrantyExpense {
  id: number;
  code: string;
  reason_id: number;
  reason: string;
}
export interface WarrantyListRequest {
  ids?: string[];
  store_ids: number[];
  customer_ids?: number[];
  customer?: string;
  warranty_status?: WarrantyStatus;
  financial_status?: WarrantyFinancialStatus;
  return_status?: WarrantyReturnStatusModel;
  type?: WarrantyItemTypeModel;
  warranty_type?: WarrantyFormType;
  warranty_center_ids?: number[];
  from_appointment_date?: Date;
  to_appointment_date?: Date;
  from_created_date?: Date;
  to_created_date?: Date;
}

export interface WarrantyModel extends BaseObject {
  assignee: string;
  assignee_code: string;
  customer: string;
  customer_address: string;
  customer_code: string;
  customer_id: number;
  customer_mobile: string;
  financial_status: WarrantyFinancialStatus;
  note: string;
  payments: WarrantyPayment[];
  reference: string;
  status: WarrantyItemStatus;
  store: string;
  store_id: number;
  total_amount: number;
  price: number | null;
  type: WarrantyFormType;
  line_items: WarrantyItemModel[];
  return_status: WarrantyReturnStatusModel;
  purchase_date: Date | null;
  appointment_date: Date | null;
}

export interface WarrantyItemModel extends BaseObject {
  appointment_date: Date | null;
  purchase_date: Date | null;
  product_id: number;
  product: string;
  variant_id: number;
  variant: string;
  sku: string;
  warranty_center_id: number;
  warranty_center: string;
  note: string;
  fixing_date: Date;
  fixed_date: Date;
  price: number | null;
  customer_fee: number | null;
  status: WarrantyItemStatus;
  type: WarrantyItemTypeModel;
  expenses: WarrantyExpense[];
  warranty: WarrantyModel;
  return_status: WarrantyReturnStatusModel;
}

export interface GetWarrantiesParamModel extends BaseQuery {
  ids?: number[];
  store_ids?: number[];
  customer_ids?: number[];
  customer?: string;
  warranty_status?: WarrantyStatus;
  financial_status?: WarrantyFinancialStatus;
  status?: WarrantyStatus;
  return_status?: any;
  from_created_date: string | undefined;
  to_created_date: string | undefined;
  from_appointment_date: string | undefined;
  to_appointment_date: string | undefined;
  type: WarrantyItemTypeModel | undefined;
}

export interface GetWarrantiesParamModelExtra extends GetWarrantiesParamModel {
  tab: string;
}

export interface DeleteWarrantiesParamModel {
  ids: {
    warranty_id: number;
    line_item_id: number;
  }[];
}

export interface WarrantyGetModel extends BaseObject {
  appointment_date: Date;
  customer_fee: number;
  expenses: [{ id: 1; code: "dBYTrN4D8rmx"; reason_id: 1; reason: "LÝ DO KHÁC" }];
  note: string;
  price: number;
  product: string;
  product_id: number;
  purchase_date: Date;
  sku: string;
  status: WarrantyStatus;
  type: WarrantyFormType;
  variant: string;
  variant_id: number;
  version: number;
  warranty: any;
  warranty_center: string;
  warranty_center_id: string;
}

// type cho danh sách bảo hành các field cập nhật
export interface WarrantiesValueUpdateGetModel {
  note: string;
  status: WarrantyItemStatus | undefined;
  return_status: WarrantyReturnStatusModel | undefined;
  warranty_center_id: number | undefined;
  price: number | undefined;
  customer_fee: number | undefined;
  appointment_date: string | undefined;
  reason_ids: number[] | undefined;
}

// type cho danh sách trạng thái sản phẩm các field cập nhật
export interface WarrantyProductStatusValueUpdateGetModel {
  type: WarrantyProductStatusTypeModel | undefined;
}

// type cho danh sách trung tâm bảo hành các field cập nhật
export interface WarrantyCenterValueUpdateGetModel {
  phone?: number;
  address?: string;
  district_id?: number;
  city_id?: number;
}

export interface WarrantyReasonsValueUpdateGetModel {
  customer_fee: number | undefined;
  price: number | undefined;
}

export interface WarrantiesUpdateDetailStatusModel {
  status?: WarrantyItemStatus;
  return_status?: WarrantyReturnStatusModel;
  payments?: {
    id?: number;
    code?: string;
    value: number;
    payment_method_id: number;
    payment_method?: string;
    line_item_id: number;
    action_by?: string;
    action_name?: string;
  };
  action_by?: string;
  action_name?: string;
}

export interface WarrantyCenterModel extends BaseObject {
  address: string;
  city: string | null;
  city_id: number | null;
  country: string;
  country_id: number;
  district: string | null;
  district_id: null;
  id: number;
  name: string;
  phone: number | null;
}

export interface WarrantyReasonModel extends BaseObject {
  customer_fee: number | null;
  id: number;
  name: string;
  price: number | null;
  type: string | null;
  status: WarrantyReasonStatusModel;
}

export interface WarrantyReasonsParamModel extends BaseQuery {
  status: WarrantyReasonStatusModel;
  from_created_date: string;
  to_created_date: string;
}

export interface FormValueCreateCenterType {
  name: string | undefined;
  phone: number | undefined;
  city_id: number | undefined;
  district_id: number | undefined;
  address: string | undefined;
}

export interface CreateWarrantyCenterParamsModel {
  name: string | undefined;
  phone: number | undefined;
  city_id: number | undefined;
  district_id: number | undefined;
  address: string | undefined;
  country_id: number | undefined;
  city: string | undefined;
  country: string | undefined;
  district: string | undefined;
}

export interface FormValueCreateReasonType {
  name: string | undefined;
  price: number | undefined;
  customer_fee: number | undefined;
  status: WarrantyReasonStatusModel | undefined;
}

export interface CreateWarrantyReasonParamsModel {
  name: string;
  price: number;
  customer_fee: number;
  status: WarrantyReasonStatusModel;
}

export interface UpdateWarrantyReasonParamsModel {
  name?: string;
  price?: number;
  customer_fee?: number;
  status?: WarrantyReasonStatusModel;
}

export interface GetWarrantyProductStatusesParamModel extends BaseQuery {
  ids?: number[];
  status?: WarrantyProductStatusTypeModel;
  type?: WarrantyItemTypeModel;
  from_created_date?: string;
  to_created_date?: string;
  query?: string;
}

export interface CreateWarrantyProductStatusFormModel {
  name?: string;
  type?: WarrantyItemTypeModel;
  status?: boolean;
}

export interface CreateWarrantyProductStatusModel {
  name: string;
  type: WarrantyItemTypeModel;
  status: WarrantyProductStatusModel;
}

export interface WarrantyProductStatusModel extends BaseObject {
  name: string;
  type: WarrantyProductStatusTypeModel;
  status: WarrantyProductStatusModel;
}

export interface UpdateWarrantyProductStatusModel {
  name: string;
  type: WarrantyProductStatusTypeModel;
  status: WarrantyProductStatusStatusModel;
}

export interface GetWarrantyReasonsParamModel extends BaseQuery {
  ids?: number[];
  name?: string;
  status?: string;
  from_created_date?: string;
  to_created_date?: string;
}

export interface GetWarrantyCentersParamModel extends BaseQuery {
  ids?: number[];
  name?: string;
  phone?: string;
  country_id?: string;
  city_id?: string;
  district_id?: string;
  from_created_date?: string;
  to_created_date?: string;
}
