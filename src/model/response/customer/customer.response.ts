import { BaseObject } from 'model/base/base.response';

export interface CustomerResponse {
  id: number | null;
  code: string | null;
  version: number | null,
  full_name: string | null,
  phone: string | null,
  email: string | null,
  facebook_url: string | null,
  group_id: number,
  type_id: number,
  company_id: number,
  company: string | null,
  tax_code : string | null,
  notes: string | null,
  customer_level_id: number,
  customer_level: string | null,
  wedding_date: number,
  birthday: number,
  gender: string | null,
  responsible_staff_id: number,
  affiliate_code: string | null,
  loyalty: number,
  billing_addresses: Array<BillingAddress>;
  shipping_addresses: Array<ShippingAddress>;
}


export interface BillingAddress extends BaseObject {
  default: boolean,
  name: string,
  email: string,
  phone: string,
  country_id: number,
  country: string,
  city_id: number,
  city: string,
  district_id: number,
  district: string,
  ward_id: number,
  ward: string,
  zip_code: string,
  full_address: string
}

export interface ShippingAddress extends BaseObject {
  default: boolean,
  name: string,
  email: string,
  phone: string,
  country_id: number,
  country: string,
  city_id: number,
  city: string,
  district_id: number,
  district: string,
  ward_id: number,
  ward: string,
  zip_code: string,
  full_address: string
}