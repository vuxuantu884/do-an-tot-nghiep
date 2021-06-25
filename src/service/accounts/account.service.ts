import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { AccountSearchQuery,LoginResponse ,AccountResponse, AccountRequest} from "model/account/account.model";
import { AuthenRequest } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { DepartmentResponse } from 'model/account/department.model';
import { PositionResponse } from 'model/account/position.model';

export const getAcccountDetail = (): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}

export const loginApi = (request: AuthenRequest): Promise<BaseResponse<LoginResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts/login`, request);
}

export const logoutApi = (): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/logout`);
}

export const searchAccountApi = (query: AccountSearchQuery): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?${params}`);
}

export const AccountCreateService = (request: AccountRequest): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts`, request)
}

export const AccountUpdateService = (id: number, request: AccountRequest): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/accounts/${id}`, request)
}

export const AccountGetByIdService = (id: number): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/${id}`)
}


export const getDepartmentAllApi = (): Promise<BaseResponse<DepartmentResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments`);
}

export const getPositionAllApi = (): Promise<BaseResponse<PositionResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/positions`);
}

export const searchShipperApi = (): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?is_shipper=1`);
}