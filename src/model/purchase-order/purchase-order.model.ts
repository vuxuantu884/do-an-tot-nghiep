import { BaseQuery } from "model/base/base.query";
import { PurchaseAddress } from "./purchase-address.model";
import { PurchaseOrderLineItem } from "./purchase-item.model";
import { PurchaseTransaction } from "./purchase-transaction.model";

export interface PurchaseOrder {
  id: number,
  companyId: number,
  assign_account_code: string,
  code: string,
  supplier_id: number,
  supplier: string,
  supplier_note:string,
  phone:string,
  billing_address: PurchaseAddress,
  supplier_address: PurchaseAddress,
  line_items: Array<PurchaseOrderLineItem>,
  note: string,
  tags: string,
  policy_price_code: string,
  
  transactions: Array<PurchaseTransaction>,
  trade_discount_rate: number,
  trade_discount_value: number,
  trade_discount_amount: number,
  payment_discount_rate: number,
  payment_discount_value: number,
  payment_discount_amount: number,
  untaxed_amount: number,
  tax: number,
  total: number,
  total_refunds: number,
  status: string,
  financial_status: string,
  receive_status: string,
  cancel_reason: string,
  order_date: string,
  cancelled_date: string,
  activated_date: string,
  completed_date: string,
  payment_term_id: string,
}

export interface PurchaseOrderQuery extends BaseQuery{
  code:string,
  supplier_id?:number,
  
}
