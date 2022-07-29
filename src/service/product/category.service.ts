import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  CategoryQuery,
  CategoryUpdateRequest,
  CategoryCreateRequest,
  CategoryResponse,
} from "model/product/category.model";
import { generateQuery } from "utils/AppUtils";

export const getCategoryApi = (
  query: CategoryQuery,
): Promise<BaseResponse<Array<CategoryResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.PRODUCT}/categories?${params}&status=active`,
  );
};

export const updateCategoryApi = (
  id: string,
  request: CategoryUpdateRequest,
) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/categories/${id}`, request);
};

export const categoryDetailApi = (
  id: number,
): Promise<BaseResponse<CategoryResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories/${id}`);
};

export const createCategoryApi = (request: CategoryCreateRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/categories`, request);
};

export const categoryDeleteApi = (
  id: number,
): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/categories/${id}`);
};
