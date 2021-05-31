import { OrderItemDiscountModel } from './OrderItemDiscountModel';

export interface OrderItemModel {
  id: number;
  sku: string;
  variant_id: number;
  variant: string;
  product_id: number;
  product: string;
  show_note: boolean;
  variant_barcode: string;
  product_type: string;
  quantity: number;
  price: number;
  amount: number;
  note: string;
  type: string;
  variant_image: string;
  unit: string;
  warranty: string;
  tax_rate: number;
  tax_include: boolean;
  is_composite: boolean;
  line_amount_after_line_discount: number;
  discount_items: Array<OrderItemDiscountModel>;
  discount_rate: number;
  discount_value: number;
  discount_amount: number;
  gifts: Array<OrderItemModel>;
}
