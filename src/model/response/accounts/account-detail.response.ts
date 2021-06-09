import { AccountStore } from './../../other/Account/AccountStore';
import { BaseObject } from "../base.response";
import { AccountJobResponse } from "./account-job.response";
export interface AccountResponse extends BaseObject {
  user_name: string,
  user_id: string,
  full_name: string,
  gender: string,
  gender_name: string,
  mobile: string,
  birthday: number,
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
  account_stores: Array<AccountStore>,
}