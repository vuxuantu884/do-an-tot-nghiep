import { BaseObject } from "model/base/base.response";
import { PurchaseOrderLineReturnItem } from "./purchase-item.model";

export interface PurchaseReturnOrder extends BaseObject {
  amount_tax_refunds: number | null;
  expect_return_date: string;
  line_return_items: Array<PurchaseOrderLineReturnItem>;
  payment_return_note: string;
  return_reason: string;
  store_id: number;
  total_refunds: number;
  untaxed_amount_refunds: number;
}
