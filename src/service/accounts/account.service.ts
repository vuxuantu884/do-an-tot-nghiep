import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AccountSearchQuery, LoginResponse, AccountResponse, AccountRequest } from "model/account/account.model";
import { AuthenRequest } from "model/auth/roles.model";
import { PageResponse } from "model/base/base-metadata.response";
import { DepartmentResponse } from 'model/account/department.model';
import { PositionResponse } from 'model/account/position.model';

export const getAccountDetail = (): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/me`);
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

export const AccountGetByIdService = (code: string): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/code/${code}`)
}


export const AccountDeleteService = (id: number): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.delete(`${ApiConfig.ACCOUNTS}/accounts/${id}`)
}
export const AccountManyDeleteService = (ids: number[]): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.delete(`${ApiConfig.ACCOUNTS}/accounts/${ids}`)
}

export const getDepartmentAllApi = (): Promise<BaseResponse<DepartmentResponse[]>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments`);
}

export const getPositionAllApi = (): Promise<BaseResponse<PositionResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/positions`);
}

export const searchShipperApi = (): Promise<BaseResponse<PageResponse<AccountResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?is_shipper=1`);
}

export const powerBIEmbededApi = (params: any): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/power-bi/groups/${params.group_id}/reports/${params.report_id}`,
  {
    access_level: 'View',
    allow_save_as: 'false'
  });
}

export const accountUpdatePassScreenService = (request: AccountRequest): Promise<BaseResponse<AccountResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/me/update-password`, request)
}