import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { CategoryQuery, CategoryUpdateRequest, CategoryCreateRequest, CategoryResponse } from "model/product/category.model";
import { generateQuery } from "utils/AppUtils";

export const getCategoryApi = (query: CategoryQuery): Promise<BaseResponse<Array<CategoryResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories?${params}`)
}

export const updateCategoryApi = (id: string, request: CategoryUpdateRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/categories/${id}`, request);
}

export const categoryDetailApi = (id: number): Promise<BaseResponse<CategoryResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories/${id}`);
}

export const createCategoryApi = (request: CategoryCreateRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/categories`, request);
}

export const categoryDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/categories/${id}`);
}