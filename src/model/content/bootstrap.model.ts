export interface BaseBootstrapResponse {
  name: string;
  value: string;
}

export interface BootstrapResponse {
  fulfillment_status: Array<BaseBootstrapResponse>;
  gender: Array<BaseBootstrapResponse>;
  store_status: Array<BaseBootstrapResponse>;
  supplier_type: Array<BaseBootstrapResponse>;
  shipping_type: Array<BaseBootstrapResponse>;
  goods: Array<BaseBootstrapResponse>;
  product_status: Array<BaseBootstrapResponse>;
  shipping_requirement: Array<BaseBootstrapResponse>;
  moq_unit: Array<BaseBootstrapResponse>;
  scorecard: Array<BaseBootstrapResponse>;
  length_unit: Array<BaseBootstrapResponse>;
  order_status: Array<BaseBootstrapResponse>;
  supplier_status: Array<BaseBootstrapResponse>;
  shipping_fee_type: Array<BaseBootstrapResponse>;
  delivery_type: Array<BaseBootstrapResponse>;
  currency: Array<BaseBootstrapResponse>;
  product_price_type: Array<BaseBootstrapResponse>;
  brand: Array<BaseBootstrapResponse>;
  date_unit: Array<BaseBootstrapResponse>;
  variant_status: Array<BaseBootstrapResponse>;
  payment_status: Array<BaseBootstrapResponse>;
  collection: Array<BaseBootstrapResponse>;
  product_unit: Array<BaseBootstrapResponse>;
  product_type: Array<BaseBootstrapResponse>;
  weight_unit: Array<BaseBootstrapResponse>;
  tax_treatment: Array<BaseBootstrapResponse>;
  discount_source: Array<BaseBootstrapResponse>;
  account_status: Array<BaseBootstrapResponse>;
  order_main_status: Array<BaseBootstrapResponse>;
  print_size: Array<BaseBootstrapResponse>;
  print_type: Array<BaseBootstrapResponse>;
  print_variable: Array<BaseBootstrapResponse>;
  stock_sync_status: Array<BaseBootstrapResponse>;
  connect_product_status: Array<BaseBootstrapResponse>;
  fabric_size_unit: Array<BaseBootstrapResponse>;
  weight_material_unit: Array<BaseBootstrapResponse>;
  material_status: Array<BaseBootstrapResponse>;
  price_measure_unit: Array<BaseBootstrapResponse>;
}
