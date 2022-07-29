import { AccountResponse } from "model/account/account.model";

export interface UserReducerType {
  isLogin: boolean;
  isLoad: boolean;
  isError: boolean;
  account: AccountResponse | null;
}
