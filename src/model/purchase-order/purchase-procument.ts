import { BaseQuery } from "model/base/base.query";
import { ParsedUrlQueryInput } from "querystring";
import { BaseObject } from "./../base/base.response";
import { PurchaseOrderLineItemDraft } from "./purchase-item.model";
export interface PurchaseProcument extends BaseObject {
  reference: string;
  store_id: number;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseProcumentLineItem>;
  status: string;
  note: string;
  actived_date: string|null;
  actived_by: string|null;
  stock_in_date: string|null;
  stock_in_by: string|null;
  store?: string;
  is_cancelled?: boolean
  
}
export interface PurchaseProcurementViewDraft {
  id?: number,
  fake_id: number,
  reference?: string;
  store_id: number;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseOrderLineItemDraft>;
  status: string;
  note?: string;
  actived_date?: string;
  actived_by?: string;
  stock_in_date?: string;
  stock_in_by?: string;
  store?: string;
}
export interface PurchaseProcurementPOCreate {
  store_id: string;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseProcumentPOCreateLineItem>;
  status: string;
}

export interface PurchaseProcumentPOCreateLineItem {
  id?: number;
  code?: string;
  line_item_id?: number;
  sku: string;
  variant: string;
  variant_image: string | null;
  ordered_quantity: number;
  planned_quantity: number;
  accepted_quantity: number;
  quantity: number;
  real_quantity: number;
  note: string;
}

export interface PurchaseProcumentLineItem {
  id?: number;
  code?: string;
  line_item_id: number;
  sku: string;
  variant: string;
  variant_image: string | null;
  ordered_quantity: number;
  planned_quantity: number;
  accepted_quantity: number;
  quantity: number;
  real_quantity: number;
  note: string;
}

const POProcumentField = {
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
};

const POProcumentLineItemField = {
  id: "id",
  line_item_id: "line_item_id",
  sku: "sku",
  variant: "variant",
  variant_image: "variant_image",
  ordered_quantity: "ordered_quantity",
  accepted_quantity: "accepted_quantity",
  planned_quantity: "planned_quantity",
  quantity: "quantity",
  real_quantity: "real_quantity",
  note: "note",
};

export interface ProcurementQuery extends BaseQuery, ParsedUrlQueryInput {
  content?: number,
  active_from?: string,
  active_to?: string,
  active_by?: string,
  stock_in_from?: string,
  stock_in_to?: string,
  stock_in_by?: string,
  merchandisers?: string,
  status?: string,
  store?: string,
  expect_receipt_from?: string,
  expect_receipt_to?: string,
}

export { POProcumentField, POProcumentLineItemField };
