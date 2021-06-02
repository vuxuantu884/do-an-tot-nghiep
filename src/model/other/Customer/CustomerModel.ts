import { BaseModel } from './../BaseModel';

export interface CustomerModel extends BaseModel {
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
  level_id: number,
  wedding_date: number,
  birthday: number,
  gender: string,
  responsible_staff_id: number,
  point: number,
  affiliate_code: string,
  loyalty: number,
  billing_address: Array<BillingAddress>;
  shipping_address: Array<ShippingAddress>;
}


export interface BillingAddress extends BaseModel {
  is_default: boolean,
  name: string,
  email: string,
  phone: string,
  country: string,
  city: string,
  district: string,
  zipCode: string,
  fullAddress: string
}

export interface ShippingAddress extends BaseModel {
  is_default: boolean,
  name: string,
  email: string,
  phone: string,
  country: string,
  city: string,
  district: string,
  zipCode: string,
  fullAddress: string
}