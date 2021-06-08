import { BaseModel } from '../../other/base-model';

export interface CustomerResponse extends BaseModel {
  first_name: string,
  last_name: string,
  full_name: string,
  phone: string,
  email: string,
  facebook_url: string,
  group_id: number,
  type_id: number,
  company_id: number,
  company: string,
  tax_code : string,
  note: string,
  customer_level_id: number,
  customer_level_name: string,
  wedding_date: number,
  birthday: number,
  gender: string,
  responsible_staff_id: number,
  affiliate_code: string,
  loyalty: number,
  billing_address: Array<BillingAddress>;
  shipping_address: Array<ShippingAddress>;
}


export interface BillingAddress extends BaseModel {
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

export interface ShippingAddress extends BaseModel {
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