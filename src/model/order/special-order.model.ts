import { BaseObject } from "model/base/base.response";

export interface SpecialOrderValueModel {
  title: string;
  value: string;
  displayFields: string[];
}

export interface SpecialOrderFormValueModel {
  type: string | undefined;
  order_original_code: string | undefined;
  order_carer_code: string | undefined;
  skus: string[] | undefined;
  order_return_code: string | undefined;
  amount: number | undefined;
  reason: string | undefined;
  ecommerce: string | undefined;
}

export interface SpecialOrderModel {
  type: string | undefined | null;
  order_original_code: string | undefined | null;
  order_carer_code: string | undefined | null;
  variant_skus: string | undefined | null;
  order_return_code: string | undefined | null;
  amount: number | undefined | null;
  reason: string | undefined | null;
  ecommerce: string | undefined | null;
}

export interface SpecialOrderResponseModel extends BaseObject {
  id: number;
  type: string | null;
  order_carer_code: string | null;
  order_carer_name: string | null;
  order_original_code: string | null;
  order_return_code: string | null;
  variant_skus: string | null;
  amount: number | null;
  reason: string | null;
  ecommerce: string | null;
}

export enum SpecialOrderOrderTypeInFormModel {
  order = "order",
  orderReturn = "orderReturn",
}

export enum SpecialOrderType {
  detail = "detail",
  update = "update",
}
