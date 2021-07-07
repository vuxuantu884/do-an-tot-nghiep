import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/base/base-metadata.response";
import { MaterialResponse, MaterialCreateRequest, MaterialUpdateRequest, MaterialQuery } from "model/product/material.model";
import { generateQuery } from "utils/AppUtils";

export const getMaterialApi = (query: MaterialQuery): Promise<BaseResponse<PageResponse<MaterialResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/materials?${queryString}`);
}

export const deleteOneMaterialApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/materials/${id}`);
}

export const deleteManyMaterialApi = (ids: Array<number>): Promise<BaseResponse<string>> => {
  let idsParam =  ids.join(',');
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/materials?ids=${idsParam}`);
}

export const createMaterialApi = (request: MaterialCreateRequest): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/materials`, request);
}

export const detailMaterialApi = (materialId: number): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/materials/${materialId}`);
}

export const updateMaterialApi = (materialId: number,request: MaterialUpdateRequest): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/materials/${materialId}`, request);
}