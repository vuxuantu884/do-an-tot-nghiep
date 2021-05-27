import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from 'model/response/base-metadata.response';
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";

export const getAcccountDetail = (): Promise<BaseResponse<AccountDetailResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts/detail`);
}

export const getAccountByDepartment = (department_id:number): Promise<BaseResponse<PageResponse<AccountDetailResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/accounts?department_ids=${department_id}`);
}