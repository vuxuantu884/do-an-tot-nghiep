export interface StockInOutItemsOther {
  id?: number;
  code?: string;
  sku: string;
  barcode: string;
  variant_id: number;
  product_id: number;
  product: string;
  quantity: number;
  amount: number;
  variant_image: string | null;
  unit: string | null;
  receipt_quantity: number;
  policy_price: string;
  retail_price: number;
  cost_price: number;
  wholesale_price: number;
  import_price: number;
  variant_name: string;
  [key: string]: any;
}

export interface StockInOutOtherData {
  store_id: number;
  store: string;
  stock_in_out_reason: string | null;
  policy_price: string;
  account_name: string;
  account_code: string;
  partner_name?: string | null;
  partner_mobile?: string | null;
  partner_address?: string | null;
  internal_note?: string | null;
  partner_note?: string | null;
  type: string;
  stock_in_out_other_items: Array<StockInOutItemsOther>;
  [key: string]: any;
}

export interface StockInOutOther {
  id: number;
  code: string;
  certificate_code: string;
  store_id: number;
  store: string;
  stock_in_out_reason: string;
  policy_price: string;
  account_name: string;
  account_code: string;
  partner_name: string | null;
  partner_mobile: string | null;
  partner_address: string | null;
  internal_note: string | null;
  partner_note: string | null;
  type: string;
  stock_in_out_other_items: Array<StockInOutItemsOther>;
  created_by?: string;
  created_date?: Date;
  created_name?: string;
  status: string;
}

export interface StockInOutOtherPrint {
  id: number;
  html_content: string;
  size: string;
}
