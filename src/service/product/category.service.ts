import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { CategoryQuery } from "model/query/category.query";
import { CreateCatergoryRequest, UpdateCatergoryRequest } from "model/request/create-category.request";
import { CategoryResponse } from "model/response/category.response";
import { generateQuery } from "utils/AppUtils";

export const getCategoryApi = (query: CategoryQuery): Promise<BaseResponse<Array<CategoryResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories?${params}`)
}

export const updateCategoryApi = (id: string, request: UpdateCatergoryRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/categories/${id}`, request);
}

export const categoryDetailApi = (id: number): Promise<BaseResponse<CategoryResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories/${id}`);
}


export const createCategoryApi = (request: CreateCatergoryRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/categories`, request);
}