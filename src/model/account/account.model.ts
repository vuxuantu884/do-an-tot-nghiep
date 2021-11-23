import { ModuleAuthorize } from "model/auth/module.model";
import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";

export interface AccountBaseModel {
  user_name: string;
  user_id?: string;
  full_name: string;
  gender: string;
  password: string;
  mobile: string;
  version?: number;
  country_id?: number;
  city_id?: number;
  district_id?: number;
  address: string;
  status: string;
  is_shipper?: boolean;
  code: string;
  birthday?: string;
  role_id : number;
}

export interface AccountResponse extends AccountBaseModel, BaseObject { 
  gender_name: string;
  country_name: string;
  city_name: string;
  district: string;
  status_name: string;
  account_jobs: Array<AccountJobResponse>;
  account_stores: Array<AccountStoreResponse>; 
  permissions : {  
    modules: Array<ModuleAuthorize>,
  }
  role_name: string;
}

export interface AccountSearchQuery extends BaseQuery {
  code?: string;
  department_ids?: Array<number>;
  from_date?: Date;
  to_date?: Date;
  info?: string;
  mobile?: string;
  position_ids?: number;
  role_id?: Array<number>;
  store_ids?: Array<number>;
  status?:string
}

export interface AccountJobResponse {
  position_id: number;
  position_name?: string;
  department_id: number;
  department_name?: string;
}

export interface AccountStoreResponse {
  id?:number,
  store_id?: number;
  store?: string;
}
export interface AccountRolesResponse {
  id?:number,
  role_id?: number;
  role_name?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

//Request

export interface AccountJobReQuest {
  position_id: number;
  department_id: number;
  department_name: string;
  position_name: string;
  key: number;
  id?: number;
}

export interface AccountView extends AccountBaseModel {  
  account_jobs?: Array<AccountJobReQuest>;
  account_stores: Array<number>;
  permissions? : {
    modules: Array<ModuleAuthorize>,
  }
}

// for create and update screen
export interface AccountRequest extends AccountBaseModel { 
  account_jobs: Array<AccountJobResponse>;
  account_stores: Array<AccountStoreResponse>; 
}

