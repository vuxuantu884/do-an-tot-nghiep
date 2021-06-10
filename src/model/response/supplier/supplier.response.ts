import { BaseObject } from "model/response/base.response";

export interface GoodsObj {
  value: string,
  name: string
}

export interface SupplierResponse extends BaseObject {
  name: string,
  type: string,
  type_name: string,
  goods: Array<GoodsObj>,
  address: string,
  country_id: number,
  country_name: string,
  city_id: string,
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
