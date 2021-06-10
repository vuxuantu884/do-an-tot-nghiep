import { AccountResponse } from "model/account/account.response";

export interface UserReducerType {
  isLogin: boolean;
  isLoad: boolean;
  isError: boolean;
  account: AccountResponse|null;
}