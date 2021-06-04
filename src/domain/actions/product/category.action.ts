import BaseAction from "base/BaseAction"
import { CategoryType } from "domain/types/product.type";
import { CategoryQuery } from "model/query/category.query";
import { CreateCatergoryRequest } from "model/request/create-category.request";
import { CategoryResponse } from "model/response/category.response";

export const getCategoryRequestAction = (query: CategoryQuery, setData: (data: Array<CategoryResponse>) => void) => {

  
  return BaseAction(CategoryType.GET_CATEGORY_REQUEST, {query, setData});
}

 export const createCategoryAction = (request: CreateCatergoryRequest, onCreateSuccess: () => void) => {
  return BaseAction(CategoryType.CREATE_CATEGORY_REQUEST, {request, onCreateSuccess});
 }

export const getCategorySuccessAction = () => {
  return BaseAction(CategoryType.GET_CATEGORY_SUCCESS, null);
}
