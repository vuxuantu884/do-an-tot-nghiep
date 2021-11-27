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
