import { BaseModel } from "../BaseModel";
import { AccountJob } from "./AccountJob";
import { AccountStore } from "./AccountStore";

export interface AccountModel extends BaseModel {
  user_name: string;
  user_id: string;
  full_name: string;
  gender: string;
  gender_name: string;
  mobile: string;
  birthday: number;
  country_id: number;
  country_name: string;
  city_id: number;
  city_name: string;
  district_id: number;
  district_name: string;
  address: string;
  status: string;
  status_name: string;
  account_jobs: Array<AccountJob>;
  account_stores: Array<AccountStore>;
}