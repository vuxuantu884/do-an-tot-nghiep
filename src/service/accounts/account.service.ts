import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { AccountSearchQuery } from "model/query/account.search.query";
import { LoginRequest } from "model/request/login.request";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { LoginResponse } from "model/response/accounts/login.response";
import { PageResponse } from "model/response/base-metadata.response";

export const getAcccountDetail = (): Promise<BaseResponse<AccountDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}

export const loginApi = (request: LoginRequest): Promise<BaseResponse<LoginResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts/login`, request);
}

export const logoutApi = (): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/logout`);
}

export const searctAccountApi = (query: AccountSearchQuery): Promise<BaseResponse<PageResponse<AccountDetailResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?${params}`);
}