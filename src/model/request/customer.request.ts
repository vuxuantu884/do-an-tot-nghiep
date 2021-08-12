interface BaseObject {
    created_by: number| null;
    created_name: string | null;
    updated_by: number| null;
    updated_name: string | null;
    request_id: string | null;
    operator_kc_id: string | null;
}

export interface CustomerBillingAddress extends BaseObject {
  id:  number;
  is_default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number | null;
  country: string;
  city_id: number | null;
  city: string;
  district_id: number | null;
  district: string;
  ward_id: number | null;
  ward: string;
  zip_code: string;
  full_address: string;
  customer_id: number;
  tax_code: string;
}

export class CustomerBillingAddressClass implements CustomerBillingAddress {
  id = 0;
  is_default = false;
  default = false;
  name = '';
  email = '';
  phone = '';
  country_id = 233;
  country = '';
  city_id = null;
  city = '';
  district_id = null;
  district = '';
  ward_id = null;
  ward = '';
  zip_code = '';
  full_address = '';
  customer_id = 0;
  created_by = null;
  created_name = '';
  updated_by = null;
  updated_name = '';
  request_id = ''
  operator_kc_id = '';
  tax_code = ''
}

export class CustomerShippingAddressClass implements CustomerShippingAddress {
  id = 0;
  is_default = false;
  default = false;
  name = '';
  email = '';
  phone = '';
  country_id = 233;
  country = '';
  city_id = null;
  city = '';
  district_id = null;
  district = '';
  ward_id = null;
  ward = '';
  zip_code = '';
  full_address = '';
  customer_id = 0;
  created_by = null;
  created_name = '';
  updated_by = null;
  updated_name = '';
  request_id = ''
  operator_kc_id = ''
}

export interface CustomerShippingAddress extends BaseObject {
  id:  number;
  is_default: boolean;
  name: string;
  email: string;
  phone: string;
  country_id: number | null;
  country: string;
  city_id: number | null;
  city: string;
  district_id: number | null;
  district: string;
  ward_id: number | null;
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

export class CustomerContactClass implements CustomerContact {
  id = 0;
  title = '';
  name = '';
  email = '';
  phone = '';
  note = '';
  customer_id = 0;
  created_by = null;
  created_name = '';
  updated_by = null;
  updated_name = '';
  request_id = ''
  operator_kc_id = '';
}

export interface CustomerNote extends BaseObject {
    id:  number;
    content: string,
}

export class CustomerNoteClass implements CustomerNote {
  id =  0;
  content = '';
  customer_id = 0;
  created_by = null;
  created_name = '';
  updated_by = null;
  updated_name = '';
  request_id = ''
  operator_kc_id = '';
}


export interface CustomerRequest extends BaseObject {

  code: string | null;
  full_name: string;
  phone: string;
  email: string;
  customer_group_id: number | null;
  customer_group: string | null;
  customer_type_id: number | null;
  customer_type: string | null;
  customer_level_id: number | null;
  customer_level: string | null; 
  company_id: number | null;
  company: string | null;
  description: string | null,
  wedding_date: string | null;
  birthday: string | null;
  gender: string;
  website: string;
  status: string;
  tags: string;
  responsible_staff_code: string | null;
  billing_addresses: Array<CustomerBillingAddress>;
  shipping_addresses: Array<CustomerShippingAddress>;
  contacts: Array<CustomerContact>;
  notes: Array<CustomerNote>;
}

export class CustomerModel implements CustomerRequest {
  created_name = '';
  created_by = null;
  updated_name= '';
  updated_by = null;
  operator_kc_id = '';
  request_id = '';
  code = '';
  full_name = '';
  phone = '';
  email = '';
  customer_group_id = 1;
  customer_group  = '';
  customer_type_id = null;
  customer_type = '';
  customer_level_id = null;
  customer_level = ''; 
  company_id = 1;
  company = '';
  description = '';
  wedding_date = null;
  birthday = null;
  gender = '';
  website = '';
  status = 'active';
  tags = '';
  responsible_staff_code = '';
  billing_addresses: Array<CustomerBillingAddress> = [];
  shipping_addresses: Array<CustomerShippingAddress> = [];
  contacts: Array<CustomerContact> = [];
  notes: Array<CustomerNote> = [];
}

export interface CustomerUpdateRequest extends CustomerRequest{
    shopping_histories: Array<any>;
}