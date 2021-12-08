export interface LineItemRequestModel {
  product_id: number;
  variant_id: number;
  sku: string;
  quantity: number;
  original_unit_price: number;
}

export interface CouponRequestModel {
  order_id: number | null;
  customer_id: number | null;
  store_id: number | null;
  sales_channel_name: string;
  order_source_id: number | null;
  line_items: LineItemRequestModel[];
  applied_discount: {
    code: string;
  };
  taxes_included: boolean | null;
  tax_exempt: boolean | null;
}

export interface DiscountRequestModel {
  order_id: number | null;
  customer_id: number | null;
  gender: string | null;
  customer_group_id: number | null;
  customer_loyalty_level_id: number | null;
  customer_type_id: number | null;
  birthday_date: string | null;
  wedding_date: string | null;
  store_id: number | null;
  sales_channel_name: string;
  order_source_id: number | null;
  assignee_code: string | null;
  line_items: LineItemRequestModel[];
  applied_discount: {
    code: string;
  }|null;
  taxes_included: boolean | null;
  tax_exempt: boolean | null;
}
