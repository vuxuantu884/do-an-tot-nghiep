export interface PurchaseAddress {
  id?: number;
  code?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  tax_code?: string;
  country_id?: number;
  country?: string;
  city_id?: number;
  city?: string;
  district_id?: number;
  district?: string;
  ward_id?: number;
  ward?: string;
  zip_code?: string;
  full_address?: string;
  purchase_order_id?: number;
}
