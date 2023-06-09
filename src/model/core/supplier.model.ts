import { BaseObject } from "model/base/base.response";
import { BaseQuery } from "model/base/base.query";
import { CollectionResponse } from "../product/collection.model";

export interface SupplierResponse extends BaseObject {
  name: string;
  type: string;
  type_name: string;
  contact_name: string;
  supplier_category: string;
  identity_number: string | null;
  phone: any;
  email: string | null;
  website: string | null;
  date_established: number;
  tax_code: string;
  certification: Array<String>;
  bank_name: string | null;
  bank_brand: string | null;
  bank_number: string | null;
  beneficiary_name: string | null;
  status: string;
  status_name: string;
  moq: string;
  moq_unit: string;
  moq_unit_name: string;
  scorecard: string | null;
  scorecard_name: string | null;
  note: string | null;
  pic_code: string;
  pic: string;
  collection: CollectionResponse;
  debt_time: number | null;
  debt_time_unit: string | null;
  debt_time_unit_name: string | null;
  collection_ids: Array<number> | null;
  collections: Array<CollectionResponse>;
  payments: Array<SupplierPaymentResposne>;
  addresses: Array<SupplierAddressResposne>;
  contacts: Array<SupplierContactResposne>;
}

export interface SupplierContactResposne {
  id: number;
  code: string;
  supplier_id: number;
  name: string;
  phone: string;
  tax_code: string;
  fax: string;
  email: string;
  website: string;
  is_default: boolean;
}

export interface SupplierAddressResposne {
  id: number;
  code: string;
  supplier_id: number;
  country_id: number;
  country: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  is_default: boolean;
  address: string;
}

export interface SupplierPaymentResposne {
  id: number;
  code: string;
  name: string;
  brand: string;
  number: string;
  beneficiary: string;
}

export interface SupplierQuery extends BaseQuery {
  ids?: string;
  country_id?: number;
  city_id?: number;
  district_id?: string;
  contact?: string;
  created_name?: string;
  from_created_date?: string;
  to_created_date?: string;
  condition?: string;
  note?: string;
  pics?: Array<string>;
  scorecard?: string;
  sort_column?: string;
  sort_type?: string;
  status?: string;
  type?: string;
  codes?: Array<string>;
  collection_id?: string;
}

export interface SupplierCreateRequest {
  bank_brand: string | null;
  bank_name: string | null;
  supplier_category: string | null;
  bank_number: string | null;
  beneficiary_name: string | null;
  certifications: Array<string>;
  debt_time: number | null;
  debt_time_unit: string | null;
  goods: Array<string>;
  moq: number | null;
  name: string;
  note: string | null;
  person_in_charge: string | null;
  scorecard: string | null;
  status: string;
  tax_code: string | null;
  type: string;
  phone?: any;
  collection_ids?: Array<number>;
  addresses: Array<SupplierAddress>;
  contacts: Array<SupplierContact>;
  payments: Array<SupplierPayment>;
}

export interface SupplierAddress {
  id: number | null;
  country_id: number | null;
  city_id: number | null;
  district_id: number | null;
  address: string | null;
  is_default: boolean;
  supplier_id: number | null;
}

export interface SupplierContact {
  id: number | null;
  name: string;
  email: string | null;
  fax: string | null;
  phone: string | null;
  website: string | null;
  is_default: boolean;
  supplier_id: number | null;
  position?: string | null;
}

export interface SupplierPayment {
  id: number | null;
  name: string | null;
  brand: string | null;
  number: string | null;
  beneficiary: string | null;
  supplier_id: number | null;
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
  version: number;
  code: string;
}
