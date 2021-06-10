import { AccountStoreResponse } from './account-store.response';
import { BaseObject } from "../response/base.response";
import { AccountJobResponse } from "./account-job.response";
export interface AccountRequest extends BaseObject {
  user_name: string,
  user_id: string,
  full_name: string,
  gender: string,
  mobile: string,
  birthday: string,
  country_id: number,
  city_id: number,
  district_id: number,
  address: string,
  status: string,
  account_jobs: Array<AccountJobResponse>,
  account_stores: Array<AccountStoreResponse>,
}