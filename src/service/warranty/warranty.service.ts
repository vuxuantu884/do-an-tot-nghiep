// import { generateQuery } from 'utils/AppUtils';
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { GetWarrantiesParamModel, WarrantyModel } from "model/warranty/warranty.model";
import { generateQuery } from "utils/AppUtils";


export const getWarrantiesService = (query?: GetWarrantiesParamModel): Promise<BaseResponse<PageResponse<WarrantyModel>>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.WARRANTY}/cards?${params}`);
}

export const getWarrantyDetailService = (id: number): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/cards/${id}`);
}

export const createWarrantyService = (body: any): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.WARRANTY}/warranties`, body);
}

export const getWarrantyReasonsService = (): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.WARRANTY}/warranties/reasons`);
}
export const updateWarranty = (id: string, body: any): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.WARRANTY}/warranties/${id}`, body);
}

export const updateWarrantyDetailService = (id: number, body: WarrantyModel): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.WARRANTY}/warranties/${id}`, body);
}