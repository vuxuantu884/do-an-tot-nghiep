import { BaseQuery } from "model/base/base.query";
import { ParsedUrlQueryInput } from "querystring";
import { BaseObject } from "./../base/base.response";
import { PurchaseOrderLineItemDraft } from "./purchase-item.model";
import { PurchaseOrder } from "./purchase-order.model";

export interface PurchaseProcument extends BaseObject {
  reference: string;
  store_id: number;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseProcumentLineItem>;
  purchase_order: PurchaseOrder;
  status: string;
  note: string;
  actived_date: string|null;
  actived_by: string|null;
  activated_by: string|null;
  stock_in_date: string|null;
  stock_in_by: string|null;
  store?: string;
  is_cancelled?: boolean;
}
export interface PurchaseProcurementViewDraft {
  id?: number,
  fake_id: number,
  reference?: string;
  store_id?: number;
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
  barcode: string,
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
  barcode: string;
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

export interface PurchaseProcumentLineItemManual extends PurchaseProcumentLineItem {
  fake_real_quantity: number;
  receipt_quantity: number;
  product_id?: number;
  variant_id?: number;
}

export interface ProcurementItemsReceipt extends PurchaseProcumentLineItem {
  procurement: PurchaseProcument;
  product_id?: number;
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
  supplier_id: "supplier_id",
  supplier: "supplier",
  supplier_phone: "supplier_phone",
  po_code: "po_code",
};

const POProcumentLineItemField = {
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

export interface ProcurementQuery extends BaseQuery, ParsedUrlQueryInput {
  content?: number,
  active_from?: any,
  active_to?: any,
  active_by?: string,
  stock_in_from?: any,
  stock_in_to?: any,
  stock_in_by?: string,
  merchandisers?: string,
  status?: string,
  stores?: string,
  expect_receipt_from?: any,
  expect_receipt_to?: any,
  is_cancel?: boolean
}

export interface ImportProcument {
  url: string;
  conditions: string;
  type: string;
  url_template?: string;
  note?: string;
}
export interface ProcurementConfirm {
  procurement_items: Array<PurchaseProcumentLineItem>;
  refer_ids: Array<number>
}

export interface ProcurementManual {
  reference: string;
  store_id: number;
  store: string;
  expect_receipt_date?: string;
  note?: string;
  status: string;
  is_cancelled: boolean;
  procurement_items: Array<PurchaseProcumentLineItem>;
}

export { POProcumentField, POProcumentLineItemField };
