import { ModuleAuthorize } from "model/auth/module.model";
import { BaseQuery } from "model/base/base.query";
import { BaseObject } from "model/base/base.response";
import { PageResponse } from "../base/base-metadata.response";

export interface AccountBaseModel {
  user_name: string;
  user_id?: string;
  full_name: string;
  gender: string;
  password: string;
  phone: string;
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
  store_ids: Array<number>
}

export interface MerchandiserSelectResponse extends PageResponse<Pick<AccountResponse, "code" | "full_name">> {}
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
  temporary_password: boolean;
}

export interface DeliverPartnerResponse {
  address: string;
	code: string;
	id: number;
	name: string;
	phone: string;
	status: string;
	tax_code: string|null;
}
export interface AccountSearchQuery extends BaseQuery {
  code?: string;
  department_ids?: Array<number> | Array<null>;
  from_date?: Date;
  to_date?: Date;
  condition?: string;
  info?: string,
  mobile?: string;
  position_ids?: number;
  role_id?: Array<number>;
  store_ids?: Array<number>;
  status?:string;
  codes?: Array<string> | string;
  is_shipper?: number;
}

export interface AccountPublicSearchQueryModel extends BaseQuery {
  condition?: string;
  department_ids?: Array<number>;
  position_ids?: number;
  store_ids?: Array<number>;
  codes?: Array<string> | string;
  status?: "active" | "inactive";
}

export interface AccountJobResponse {
  position_id: number;
  position_name?: string;
  department_id: number;
  department_name?: string;
  department?: string;
  position?: string;
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
  permissions? : {
    modules: Array<ModuleAuthorize>,
  }
}

// for create and update screen
export interface AccountRequest extends AccountBaseModel {
  account_jobs: Array<AccountJobResponse>;
}


export interface MeRequest {
  country_id?: 0,
  city_id?: 0,
  district_id: 0,
  country?: string,
  city?: string,
  district?: string,
  address: string,
  phone?: string,
}
