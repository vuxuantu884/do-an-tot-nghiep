// import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";


export const getWarranties = (): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/list`);
}

export const getWarrantyID = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/${id}`);
}

export const createWarranty = (body: any): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}`, body);
}

export const getWarrantyReasons = (): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/reasons`);
}
