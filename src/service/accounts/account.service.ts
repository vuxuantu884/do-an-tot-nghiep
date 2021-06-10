import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { AccountSearchQuery } from "model/query/account.search.query";
import { LoginRequest } from "model/request/login.request";
import { AccountResponse } from "model/account/account.response";
import { LoginResponse } from "model/account/login.response";
import { PageResponse } from "model/response/base-metadata.response";
import { DepartmentResponse } from 'model/account/department.response';
import { PositionResponse } from 'model/account/position.response';

export const getAcccountDetail = (): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}

export const loginApi = (request: LoginRequest): Promise<BaseResponse<LoginResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts/login`, request);
}

export const logoutApi = (): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/logout`);
}

export const searchAccountApi = (query: AccountSearchQuery): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?${params}`);
}

export const getDepartmentAllApi = (): Promise<BaseResponse<DepartmentResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments`);
}

export const getPositionAllApi = (): Promise<BaseResponse<PositionResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/positions`);
}