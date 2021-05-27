import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";

export const getAcccountDetail = (): Promise<BaseResponse<AccountDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}