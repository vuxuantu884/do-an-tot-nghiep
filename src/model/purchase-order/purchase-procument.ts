import { BaseQuery } from "model/base/base.query";
import { ParsedUrlQueryInput } from "querystring";
import { BaseObject } from "./../base/base.response";
import { PurchaseOrderLineItemDraft } from "./purchase-item.model";
import { ProcurementPropertiesDate, PurchaseOrder } from "./purchase-order.model";

export interface PurchaseProcument extends BaseObject {
  reference: string;
  store_id: number;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseProcumentLineItem>;
  purchase_order: PurchaseOrder;
  status: string;
  note: string;
  actived_date: string | null;
  activated_date?: string;
  actived_by: string | null;
  activated_by: string | null;
  stock_in_date: string | null;
  stock_in_by: string | null;
  store?: string;
  is_cancelled?: boolean;
  uuid?: string;
  percent?: number;
  cancelled_date?: string | null;
  [key: string]: any;
}
export interface ProcurementItem {
  accepted_quantity?: string;
  amount?: string;
  barcode?: string;
  code: string;
  created_by: string;
  created_date: string;
  created_name: string;
  id: number;
  line_item_id?: string;
  note?: string;
  ordered_quantity?: string;
  planned_quantity?: string;
  price?: string;
  product_name?: string;
  quantity: number;
  real_quantity?: string;
  retail_price: number;
  sku: string;
  updated_by: string;
  updated_date: string;
  updated_name: string;
  variant?: string;
  variant_id: number;
  variant_image?: string;
  vat?: string;
  vat_rate?: string;
  version: number;
}

export interface PercentDate {
  month: number;
  percent: number;
  store_id: number;
  store_name: string;
}
export interface PurchaseProcurementViewDraft {
  id?: number;
  fake_id: number;
  reference?: string;
  store_id?: number;
  expect_receipt_date: string;
  procurement_items: Array<PurchaseOrderLineItemDraft>;
  status: string;
  note?: string;
  actived_date?: string;
  activated_date?: string;
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
  barcode: string;
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
  id?: number | string;
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
  variant_id: number;
  retail_price: number;
  price: number;
  product_name: string;
  amount?: number;
  [x: string]: any;
  product_id?: number;
  percent?: number;
  uuid?: string;
  status?: string;
  procurement?: PurchaseProcument;
  procurement_items?: Array<PurchaseProcumentLineItem>;
}

export interface PurchaseProcumentLineItemManual extends PurchaseProcumentLineItem {
  fake_real_quantity: number;
  receipt_quantity: number;
  product_id?: number;
}

export interface ProcurementItemsReceipt extends PurchaseProcumentLineItem {
  procurement: PurchaseProcument;
  product_id?: number;
}

export type ProcurementManualCreate = {
  procurements: Array<PurchaseProcument>;
};

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
  content?: number;
  active_from?: any;
  active_to?: any;
  active_by?: string;
  stock_in_from?: any;
  stock_in_to?: any;
  stock_in_by?: string;
  merchandisers?: string;
  status?: string;
  stores?: string;
  expect_receipt_from?: any;
  expect_receipt_to?: any;
  is_cancel?: boolean;
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
  refer_ids: Array<number>;
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

export type ProcurementCancel = {
  total: number;
  processed: number;
  success: number;
  errors: number;
  message_errors: Array<string>;
};

export { POProcumentField, POProcumentLineItemField };
