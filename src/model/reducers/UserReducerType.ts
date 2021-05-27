import { AccountDetailResponse } from "model/response/accounts/account-detail.response";

export interface UserReducerType {
  isLogin: boolean;
  isLoad: boolean;
  isError: boolean;
  account: AccountDetailResponse|null;
}