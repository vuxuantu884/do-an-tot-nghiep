import { PurchaseOrderLineItem } from "./Purchase-item.model";
import { PurchaseTransaction } from "./purchase-transaction.model";

export interface PurchaseOrder {
  id: number;
  companyId: number;
  assign_account_code: string;
  code: string;
  supplier_id: number;
  supplier: string;
  //    AddressDto billingAddress:
  //    AddressDto supplierAddress:
  lineItems: Array<PurchaseOrderLineItem>;
  note: string;
  tags: string;
  price_list_id: number;
  tax_included: boolean;
  transactions: Array<PurchaseTransaction>;
  total_discount: number;
  untaxed_amount: number;
  tax: number;
  total: number;
  total_refunds: number;
  status: string;
  financial_status: string;
  receive_status: string;
  cancel_reason: string;
  order_date: string;
  cancelled_date: string;
  activated_date: string;
  completed_date: string;
  payment_term_id: string;
}
