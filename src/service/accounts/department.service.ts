import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  DepartmentFilterProps,
  DepartmentRequest,
  DepartmentResponse,
} from "model/account/department.model";
import { generateQuery } from "utils/AppUtils";

export const departmentSearchApi = (): Promise<BaseResponse<Array<DepartmentResponse>>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments`);
};

export const departmentSearchPagingApi = (
  query: DepartmentFilterProps,
): Promise<BaseResponse<Array<DepartmentResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments/pages?${params}`);
};

export const departmentDetailApi = (id: number): Promise<BaseResponse<DepartmentResponse>> => {
  return BaseAxios.get(`${ApiConfig.ACCOUNTS}/departments/${id}`);
};

export const departmentCreateApi = (
  request: DepartmentRequest,
): Promise<BaseResponse<DepartmentResponse>> => {
  return BaseAxios.post(`${ApiConfig.ACCOUNTS}/departments`, request);
};

export const departmentUpdateApi = (
  id: number,
  request: DepartmentRequest,
): Promise<BaseResponse<DepartmentResponse>> => {
  return BaseAxios.put(`${ApiConfig.ACCOUNTS}/departments/${id}`, request);
};
