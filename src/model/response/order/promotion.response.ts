export interface ApplyCouponLineItemResponseModel {
  applied_discount: {
    allocation_limit: number | null;
    invalid: boolean;
    invalid_description: string | null;
    price_rule_id: number | null;
    title: string | null;
    value: number | null;
    value_type: string | null;
    code: string| null;
  } | null;
  category_id: number | null;
  custom: boolean;
  discounted_total: number | null;
  discounted_unit_price: number | null;
  original_total: number;
  original_unit_price: number;
  product_id: number;
  quantity: number;
  sku: string;
  suggested_discounts: any[];
  taxable: boolean;
  total_discount: number | null;
  variant_id: number | null;
}

export interface ApplyCouponResponseModel {
  applied_discount: {
    allocation_limit: number | null;
    code: string;
    invalid: boolean;
    invalid_description: string;
    price_rule_id: number | null;
    title: string;
    value: number | null;
    value_type: string | null;
  };
  line_items: ApplyCouponLineItemResponseModel[];
  customer_id: number | null;
  order_id: number | null;
  order_source_id: number | null;
  original_subtotal_price: number | null;
  sales_channel_name: string;
  store_id: number | null;
  subtotal_price: number | null;
  suggested_discounts: [];
  tax_exempt: boolean;
  taxes_included: boolean;
}
