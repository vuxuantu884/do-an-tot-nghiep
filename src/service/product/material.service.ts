import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { MaterialQuery } from "model/query/material.query";
import { CreateMaterialRequest } from "model/request/create-material.request";
import { PageResponse } from "model/response/base-metadata.response";
import { MaterialResponse } from "model/response/product/material.response";
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

export const createMaterialApi = (request: CreateMaterialRequest): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/materials`, request);
}