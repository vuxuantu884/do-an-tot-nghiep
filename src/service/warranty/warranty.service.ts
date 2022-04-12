// import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { GetWarrantiesParamModel, WarrantyModel } from "model/warranty/warranty.model";
import { generateQuery } from "utils/AppUtils";


export const getWarrantiesService = (query?: GetWarrantiesParamModel): Promise<BaseResponse<PageResponse<WarrantyModel>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.WARRANTY}/histories?${params}`);
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