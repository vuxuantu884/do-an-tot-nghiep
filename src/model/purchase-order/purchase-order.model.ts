import { BaseObject } from "./../base/base.response";
import { BaseQuery } from "model/base/base.query";
import { PurchaseAddress } from "./purchase-address.model";
import {
  Vat,
  PurchaseOrderLineItem,
} from "./purchase-item.model";
import { PurchaseProcument } from "./purchase-procument";
import { PurchasePayments } from "./purchase-payment.model";
import { PurchaseReturnOrder } from "./purchase-return.model";

export interface PurchaseOrder extends BaseObject {
  companyId: number;
  assign_account_code: string;
  supplier_id: number;
  supplier: string;
  supplier_note: string;
  phone: string;
  billing_address: PurchaseAddress;
  supplier_address: PurchaseAddress;
  line_items: Array<PurchaseOrderLineItem>;
  procurements: Array<PurchaseProcument>;
  return_orders: Array<PurchaseReturnOrder>;
  expect_return_date: string;
  note: string;
  tags: string;
  policy_price_code: string;
  is_cancel: boolean;
  payments: Array<PurchasePayments>;
  trade_discount_rate: number;
  trade_discount_value: number;
  trade_discount_amount: number;
  payment_discount_rate: number;
  payment_discount_value: number;
  payment_discount_amount: number;
  untaxed_amount: number;
  tax: number;
  total: number;
  total_paid: number;
  total_payment: number;
  total_refunds: number;
  receipt_quantity: number;
  planned_quantity: number;
  status: string;
  financial_status: string;
  receive_status: string;
  cancel_reason: string;
  order_date: string;
  cancelled_date: string;
  activated_date: string;
  completed_date: string;
  payment_term_id: string;
  tax_lines: Array<Vat>;
  import_date: string;
  store_id: number;
  payment_condition_id: number;
  payment_condition_name: string;
  payment_note: string;
  merchandiser_code: string;
  merchandiser: string;
  qc: string;
  qc_code:string;
}

export interface PurchaseOrderQuery extends BaseQuery {
  info?: string;
  from_order_date?: Date;
  to_order_date?: Date;
  from_cancelled_date?: Date;
  to_cancelled_date?: Date;
  from_activated_date?: Date;
  to_activated_date?: Date;
  from_completed_date?: Date;
  to_completed_date?: Date;
  from_expect_import_date?: Date;
  to_expect_import_date?: Date;
  status?: string;
  financial_status?: string;
  receive_status?: string;
  merchandiser?: string;
  qc?: string;
  cost_included?: boolean;
  tax_included?: boolean;
  expected_store?: string;
  note?: string;
  supplier_note?: string;
  tags?: string;
  reference?: string;
}
export interface PurchaseOrderPrint {
  purchaseOrderId: number;
  html_content: string;
  size: string;
}

export interface ProcumentLogQuery {
  condition: string
}
