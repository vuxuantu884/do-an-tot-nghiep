import {BaseObject} from 'model/response/base.response'

export interface StoreResponse extends BaseObject {
  name: string,
  rank: number,
  rank_name: string,
  square: number,
  country_id: number,
  country_name: string,
  city_id: number,
  city_name: string,
  group_id: number,
  group_name: string
  status: string,
  status_name: string,
  zip_code: string,
  district_id: number,
  district_name: string,
  ward_id: number,
  ward_name: string,
  address: string,
  full_address: string,
  hotline: string,
  manager_code: string,
  vm_code: string,
  finder_code: string,
  mail: string,
  begin_date: string,
  number_of_account: number,
  accounts: Array<any>
}