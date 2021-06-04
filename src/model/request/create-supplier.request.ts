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
  website: string|null
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
  version: number,
  code: string,
}