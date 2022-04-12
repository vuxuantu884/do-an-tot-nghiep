// import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { WarrantyModel } from "model/warranty/warranty.model";


export const getWarrantiesService = (): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/list`);
}

export const getWarrantyDetailService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/${id}`);
}

export const createWarrantyService = (body: any): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}`, body);
}

export const getWarrantyReasonsService = (): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/reasons`);
}
export const updateWarranty = (id: string, body: any): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.WARRANTY}/${id}`, body);
}

export const updateWarrantyDetailService = (id: number, body: WarrantyModel): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.WARRANTY}/${id}`, body);
}