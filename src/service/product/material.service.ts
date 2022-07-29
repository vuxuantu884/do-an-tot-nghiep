import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import {
  MaterialResponse,
  MaterialCreateRequest,
  MaterialUpdateRequest,
  MaterialQuery,
  MaterialUpdateStatusAndNoteRequest,
} from "model/product/material.model";
import { generateQuery } from "utils/AppUtils";

export const getMaterialApi = (
  query: MaterialQuery,
): Promise<BaseResponse<PageResponse<MaterialResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/materials?${queryString}`);
};

export const deleteOneMaterialApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/materials/${id}`);
};

export const deleteManyMaterialApi = (ids: Array<number>): Promise<BaseResponse<string>> => {
  let idsParam = ids.join(",");
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/materials?ids=${idsParam}`);
};

export const createMaterialApi = (
  request: MaterialCreateRequest,
): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/materials`, request);
};

export const detailMaterialApi = (materialId: number): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/materials/${materialId}`);
};

export const updateMaterialApi = (
  materialId: number,
  request: MaterialUpdateRequest,
): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/materials/${materialId}`, request);
};

export const updateMaterialStatusAndNoteApi = (
  materialId: number,
  request: MaterialUpdateStatusAndNoteRequest,
): Promise<BaseResponse<MaterialResponse>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/materials/${materialId}/update-other-info`, request);
};
