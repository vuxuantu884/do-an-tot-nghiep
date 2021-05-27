import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { LoginRequest } from "model/request/login.request";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { LoginResponse } from "model/response/accounts/login.response";

export const getAcccountDetail = (): Promise<BaseResponse<AccountDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}

export const loginApi = (request: LoginRequest): Promise<BaseResponse<LoginResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts/login`, request);
}