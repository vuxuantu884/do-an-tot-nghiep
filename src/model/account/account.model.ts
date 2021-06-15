import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface AccountRequest {
    code: string;
    user_name: string,
    user_id: string,
    full_name: string,
    gender: string,
    mobile: string,
    birthday?: Date,
    country_id?: number,
    city_id?: number,
    district_id?: number,
    address: string,
    status: string,
    password:string,
    account_jobs: Array<AccountJobReQuest>,
    account_stores: Array<number>,
    roles:Array<number>
  }

export interface AccountResponse extends BaseObject {
    user_name: string,
    user_id: string,
    full_name: string,
    gender: string,
    gender_name: string,
    mobile: string,
    birthday: Date,
    country_id: number,
    country_name: string,
    city_id: number,
    city_name: string,
    district_id: number,
    district_name: string,
    address: string,
    status: string,
    status_name: string,
    account_jobs: Array<AccountJobResponse>,
    account_stores: Array<AccountStoreResponse>,
  }

export interface AccountSearchQuery extends BaseQuery {
    code?: string, 
    department_ids?: Array<number>, 
    from_date?:Date,
    to_date?:Date
    info?:string,
    mobile?:string,
    position_ids?:number,
    role_id?: Array<number>,    
    store_ids?:Array<number>,
}

export interface AccountJobResponse extends BaseObject {
    position_id: number,
    position_name?: string,
    department_id: number,
    department_name?: string
  }
  export interface AccountJobReQuest {
    position_id: number,
    department_id: number,
    key:number
  }

  export interface AccountStoreResponse {
    account_id: number,
    user_id: string,
    store_id: number,
    store_name: string,
  }
  export interface AccountRoles {
    role_id: number,
    role_name: string
  }

  export interface LoginResponse {
    access_token: string,
    refresh_token: string,
  }