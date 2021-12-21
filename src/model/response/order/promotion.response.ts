export interface AppliedDiscountResponseModel {
  allocation_count: number | null;
  allocation_limit: number | null;
  invalid: boolean;
  invalid_description: string;
  price_rule_id: number | null;
  title: string | null;
  value: number | null;
  value_type: string | null;
  code: string | null;
}

export interface SuggestDiscountResponseModel {
  allocation_count: number | null;
  allocation_limit: number | null;
  price_rule_id: number | null;
  title: string | null;
  value: number | null;
  value_type: string | null;
}

export interface ApplyDiscountLineItemResponseModel {
  applied_discount: AppliedDiscountResponseModel | null;
  category_id: number | null;
  custom: boolean;
  discounted_total: number | null;
  discounted_unit_price: number | null;
  original_total: number;
  original_unit_price: number;
  product_id: number;
  quantity: number;
  sku: string;
  suggested_discounts: SuggestDiscountResponseModel[];
  taxable: boolean;
  total_discount: number | null;
  variant_id: number | null;
}

export interface ApplyCouponResponseModel {
  applied_discount: AppliedDiscountResponseModel;
  line_items: ApplyDiscountLineItemResponseModel[];
  customer_id: number | null;
  order_id: number | null;
  order_source_id: number | null;
  original_subtotal_price: number | null;
  sales_channel_name: string;
  store_id: number | null;
  subtotal_price: number | null;
  suggested_discounts: SuggestDiscountResponseModel[];
  tax_exempt: boolean;
  taxes_included: boolean;
}
