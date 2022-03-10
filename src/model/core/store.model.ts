import { BaseQuery } from 'model/base/base.query';
import {BaseObject} from 'model/base/base.response'

export interface StoreResponse extends BaseObject {
  id: number,
  name: string,
  rank: number,
  rank_name: string,
  square: number,
  country_id: number,
  country_name: string,
  city_id: number,
  city_name: string,
  department_id: number,
  department: string,
  departmentParentName: string,
  status: string,
  status_name: string,
  zip_code: string,
  district_id: number,
  district_name: string,
  ward_id: number,
  ward_name: string,
  address: string,
  hotline: string,
  vm:string,
  vm_code: string,
  mail: string,
  begin_date: string,
  number_of_account: number,
  accounts: Array<any>,
  is_saleable: boolean,
  is_stocktaking: boolean,
  type: string,
  type_name: string,
  reference_id?: number,
  department_h3_id?: number,
  department_h3?: string,
}

export interface StoreQuery extends BaseQuery {
    city_id?: number
    info?: string,
    country_id?: number,
    district_id?: number,
    zip_code?: string,
    ward_id?: string,
    vm_code?: string,
    finder_code?: string,
    from_begin_date?: any,
    from_square?: number|'',
    group_id?: string,
    hotline?: number|'',
    simple?: boolean,
    mail?: string,
    manager_code?: string,
    rank?: string,
    status?: string|null,
    to_begin_date?: any,
    to_square?: number|'',
    type: string|'',
    ids?: Array<number>| Array<string>,
    department_id?: string | null
    department_ids?: string | null
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
    rank: number|''
    status: string,
    begin_date: string|null
    latitude: number|null
    longtitude: number|null
    group_id: number|null,
    is_saleable: boolean,
    is_stocktaking: boolean,
    type: string|null,
    vm_code: string|null,
    department_id: number|null
  }

  export interface StoreCreateRequest extends BaseStoreRequest {
  }

  export interface StoreUpdateRequest extends BaseStoreRequest {
    version: number,
  }

  export interface StoreValidateRequest {
    name?: string,
    id?: number,
  }

  export interface StoreTypeRequest{
    name: string,
    value: string,
  }


