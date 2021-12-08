import { BaseObject } from "model/base/base.response";
import { BaseQuery } from "model/base/base.query";


export interface GoodsObj {
  value: string,
  name: string
}

export interface BankInfo {
  bank_brand: string|null,
  bank_name: string|null,
  bank_number: string|null,
  beneficiary_name: string|null
}

export interface SupplierResponse extends BaseObject {
  name: string,
  type: string,
  type_name: string,
  goods: Array<GoodsObj>,
  address: string,
  country_id: number,
  country_name: string,
  city_id: number,
  city_name: string,
  contact_name: string,
  identity_number: string|null
  phone: string|null,
  email: string|null,
  website: string|null,
  date_established: number,
  tax_code: string,
  certification: Array<String>,
  bank_name: string|null,
  bank_brand: string|null,
  bank_number: string|null,
  beneficiary_name: string|null,
  status: string,
  status_name: string,
  moq: string,
  moq_unit: string,
  moq_unit_name: string,
  scorecard: string|null,
  scorecard_name: string|null,
  note: string|null,
  district_id: number,
  district_name: string,
  person_in_charge: string,
  name_person_in_charge: string,
  debt_time: number|null,
  debt_time_unit: string|null,
  debt_time_unit_name: string|null,
}

export interface SupplierDetail extends BaseObject {
  name: string,
  type: string,
  type_name: string,
  goods: Array<String>,
  address: string,
  country_id: number,
  country_name: string,
  city_id: number,
  city_name: string,
  contact_name: string,
  identity_number: string|null
  phone: string|null,
  email: string|null,
  website: string|null,
  date_established: number,
  tax_code: string,
  certification: Array<String>,
  bank_name: string|null,
  bank_brand: string|null,
  bank_number: string|null,
  beneficiary_name: string|null,
  status: string,
  status_name: string,
  moq: string,
  moq_unit: string,
  moq_unit_name: string,
  scorecard: string|null,
  scorecard_name: string|null,
  note: string|null,
  district_id: number,
  district_name: string,
  person_in_charge: string,
  name_person_in_charge: string,
  debt_time: number|null,
  debt_time_unit: string|null,
  debt_time_unit_name: string|null,
}

export interface SupplierQuery extends BaseQuery {
  country_id?: number,
  city_id?: number,
  district_id?: string,
  contact?: string,
  created_name?: string,
  from_created_date?: string,
  to_created_date?: string,
  info?: string,
  note?: string,
  pic?: string,
  scorecard?: string,
  sort_column?: string,
  sort_type?: string,
  status?: string,
  type?: string,
  goods?: string,
  query?:string
}

export interface SupplierCreateRequest {
  address: string|null,
  bank_brand: string|null,
  bank_name: string|null,
  bank_number: string|null,
  beneficiary_name: string|null,
  certifications: Array<string>,
  city_id: number|null,
  contact_name: string,
  country_id: number|null,
  debt_time: number|null,
  debt_time_unit: string|null,
  district_id: number|null,
  email: string|null,
  fax: string|null,
  goods: Array<string>,
  moq: number|null,
  name: string,
  note: string|null,
  person_in_charge: string|null,
  phone: string|null,
  scorecard: string|null,
  status: string,
  tax_code: string|null,
  type: string,
  website: string|null,
  bank_info: Array<BankInfo>|null
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
  version: number,
  code: string,
}