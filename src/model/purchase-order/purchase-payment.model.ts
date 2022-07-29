export interface PurchasePayments {
  id?: number;
  code?: string;
  created_name?: string;
  created_by?: string;
  created_date?: Date;
  updated_by?: string;
  updated_name?: string;
  updated_date?: Date;
  version?: number;
  is_refund?: boolean;
  accountCode?: string;
  payment_method_code?: string;
  amount?: number;
  reference?: string;
  transaction_date?: string;
  note?: string;
  status?: string;
  status_name?: string;
  status_po?: string;
  purchase_order_id?: number;
}
export interface PurchasePaymentsCreate {
  payment_method_code?: string;
  amount?: number;
  reference?: string;
  transaction_date?: string;
  note?: string;
}
