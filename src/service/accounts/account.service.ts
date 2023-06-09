import { generateQuery } from "utils/AppUtils";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  AccountSearchQuery,
  LoginResponse,
  AccountResponse,
  AccountRequest,
  MeRequest,
  AccountPublicSearchQueryModel,
} from "model/account/account.model";
import { AuthenLogoutRequest, AuthenRequest } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { stringify } from "query-string";
export const getAccountDetail = (): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/me`);
};

export const loginApi = (request: AuthenRequest): Promise<BaseResponse<LoginResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/login`, request);
};

export const logoutApi = (request: AuthenLogoutRequest): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/logout`, request);
};

export const searchAccountApi = (
  query: AccountSearchQuery,
): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?${params}`);
};

export const searchAccountPublicApi = (
  query?: AccountPublicSearchQueryModel,
): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/public?${params}`);
};

export const searchAccountAllPublicApi = (): Promise<
  BaseResponse<PageResponse<AccountResponse>>
> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/public/list`);
};

export const AccountCreateService = (
  request: AccountRequest,
): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/accounts`, request);
};

export const AccountUpdateService = (
  id: number,
  request: AccountRequest,
): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/accounts/${id}`, request);
};

export const updateMeService = (request: MeRequest): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/user/profile`, request);
};

export const AccountGetByIdService = (code: string): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/code/${code}`);
};

export const AccountDeleteService = (id: number): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.delete(`${ApiConfig.ACCOUNTS}/accounts/${id}`);
};
export const AccountManyDeleteService = (ids: number[]): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.delete(`${ApiConfig.ACCOUNTS}/accounts/${ids}`);
};

export const getDepartmentAllApi = (): Promise<BaseResponse<DepartmentResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments`);
};

export const getPositionAllApi = (): Promise<BaseResponse<PositionResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/positions`);
};

export const searchShipperApi = (): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?is_shipper=1`);
};

export const externalShipperApi = (): Promise<BaseResponse<PageResponse<any>>> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/delivery-partners`);
};

export const accountUpdatePassScreenService = (
  request: AccountRequest,
): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/user/update-password`, request);
};

export const resetPasswordApi = (accountIds: number[]): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/accounts/reset-passwords`, { ids: accountIds });
};
