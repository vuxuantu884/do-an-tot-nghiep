export interface PurchaseOrderLineItem {
  id?: number;
  barcode: string;
  code?: string;
  sku: string;
  variant_id: number;
  product_id: number;
  product: string;
  variant: string;
  product_type: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
  type: string;
  variant_image: string | null;
  unit: string;
  tax: number;
  tax_rate: number;
  tax_included: boolean;
  tax_type_id: number | null;
  line_amount_after_line_discount: number;
  discount_rate: number | null;
  discount_value: number | null;
  discount_amount: number;
  position: number;
  purchase_order_id: number | null;
  temp_id: string;
  showNote: boolean;
  receipt_quantity: number;
  planned_quantity: number;
}
export interface PurchaseOrderLineReturnItem extends PurchaseOrderLineItem {
  quantity_return: number;
  untaxed_amount_refunds: null;
  amount_tax_refunds: number;
  return_reason: null;
  payment_return_note: null;
}

export interface Vat {
  rate: number;
  amount: number;
}

export interface PurchaseOrderLineItemDraft {
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
  variant_id?: number;
  product_id?: number;
  product?: string;
  product_type?: string;
  price?: number;
  amount?: number;
  type?: string;
  unit?: string;
  tax?: number;
  tax_rate?: number;
  tax_included?: boolean;
  tax_type_id?: number | null;
  line_amount_after_line_discount?: number;
  discount_rate?: number | null;
  discount_value?: number | null;
  discount_amount?: number;
  position?: number | null;
  purchase_order_id?: number | null;
  temp_id?: string;
  showNote?: boolean;
  receipt_quantity?: number;
}