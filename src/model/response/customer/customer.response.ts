import { BaseObject } from "model/base/base.response";

export interface CustomerResponse extends BaseObject {
  full_address: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  facebook_url: string | null;
  group_id: number;
  type_id: number;
  company_id: number;
  company: string | null;
  tax_code: string | null;
  notes: string | null;
  customer_level_id: number;
  customer_level: string | null;
  wedding_date: number;
  birthday: number;
  gender: string | null;
  website: string | null;
  responsible_staff_code: number;
  responsible_staff: string;
  affiliate_code: string | null;
  loyalty: number;
  billing_addresses: Array<BillingAddress>;
  shipping_addresses: Array<ShippingAddress>;
  contacts: Array<contact>;
  customer_type: string | null;
  customer_group: string | null;
  status: string;
  description: string | null;
  ward: string | null;
  district: string | null;
  city: string | null;
}

export interface BillingAddress extends BaseObject {
  default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number;
  country: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  ward_id: number;
  ward: string;
  zip_code: string;
  full_address: string;
}

export interface ShippingAddress extends BaseObject {
  default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number;
  country: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  ward_id: number;
  ward: string;
  zip_code: string;
  full_address: string;
}

export interface contact extends BaseObject {
  title: string;
  name: string;
  email: string;
  phone: string;
  note: string;
}

export interface shippingAddress extends BaseObject {
  name: string;
  phone: string;
  country_id: number;
  city: string;
  city_id: number;
  district: string;
  district_id: number;
  ward_id: number;
  ward: string;
  full_address: string;
  default: boolean;
  country: string;
}

export interface billingAddress extends BaseObject {
  name: string;
  phone: string;
  email: string;
  tax_code: string;
  country_id: number;
  city: string;
  city_id: number;
  district: string;
  district_id: number;
  ward_id: number;
  ward: string;
  full_address: string;
  default: boolean;
  country: string;
}
