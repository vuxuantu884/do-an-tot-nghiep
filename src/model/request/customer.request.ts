interface BaseObject {
    created_by: number;
    created_name: string | null;
    updated_by: number;
    updated_name: string | null;
    request_id: string | null;
    operator_kc_id: string | null;
}

export interface CustomerRequest {

  code: string | null;
  full_name: string;
  phone: string;
  email: string;
  customer_group_id: number;
  customer_group: string | null;
  customer_type_id: number;
  customer_type: string | null;
  customer_level_id: number;
  customer_level: string | null; 
  company_id: number;
  company: string | null;
  description: string | null,
  wedding_date: string | null;
  birthday: string;
  gender: string;
  responsible_staff_code: string | null;
  billing_addresses: Array<CustomerBillingAddress>;
  shipping_addresses: Array<CustomerShippingAddress>;
  contacts: Array<CustomerContact>;
  notes: Array<CustomerNote>;
}

export interface CustomerUpdateRequest extends CustomerRequest{
    shopping_history: Array<any>;
  }

export interface CustomerBillingAddress extends BaseObject {
  id:  number;
  is_default: boolean;
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
  customer_id: number;
  tax_code: string
}

export interface CustomerShippingAddress extends BaseObject {
  id:  number;
  is_default: boolean;
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
  customer_id: number;
}

export interface CustomerContact extends BaseObject {
    id:  number;
    title: string,
    name: string ,
    email: string,
    phone: string,
    note: string,
    customer_id: number;
}

export interface CustomerNote extends BaseObject {
    id:  number;
    content: string,
}
