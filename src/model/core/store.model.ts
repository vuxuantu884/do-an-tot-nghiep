import { BaseQuery } from 'model/base/base.query';
import {BaseObject} from 'model/base/base.response'
import { Moment } from "moment";

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

export interface StoreQuery extends BaseQuery {
    city_id?: number
    code?: string,
    country_id?: number,
    district_id?: number,
    zip_code?: string,
    ward_id?: string,
    vm_code?: string,
    finder_code?: string,
    from_begin_date?: Moment
    from_square?: number,
    group_id?: number,
    hotline?: number,
    is_simple?: boolean,
    mail?: string,
    manager_code?: string,
    name?: string,
    rank?: string,
    status?: string,
    to_begin_date?: Moment,
    to_square?: number,
  }

  export interface BaseStoreRequest {
    name: string
    hotline: string
    country_id: number
    city_id: number|null
    district_id: number|null
    ward_id: number|null
    address: string
    zip_code: string|null
    email: string|null
    square: number|null
    rank: number|null
    status: string,
    begin_date: Moment
    latitude: number|null
    longtitude: number|null
    group_id: number|null
  }
  
  export interface StoreCreateRequest extends BaseStoreRequest {
  }
  
  export interface StoreUpdateRequest extends BaseStoreRequest {
    version: number,
  }