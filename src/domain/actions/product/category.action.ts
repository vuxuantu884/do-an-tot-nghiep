import BaseAction from "base/BaseAction"
import { CategoryType } from "domain/types/product.type";
import { CategoryQuery } from "model/query/category.query";
import { CreateCatergoryRequest, UpdateCatergoryRequest } from "model/request/create-category.request";
import { CategoryResponse } from "model/response/product/category.response";

export const getCategoryRequestAction = (query: CategoryQuery, setData: (data: Array<CategoryResponse>) => void) => {
  return BaseAction(CategoryType.GET_CATEGORY_REQUEST, {query, setData});
}

 export const createCategoryAction = (request: CreateCatergoryRequest, onCreateSuccess: () => void) => {
  return BaseAction(CategoryType.CREATE_CATEGORY_REQUEST, {request, onCreateSuccess});
 }

export const categoryDetailAction = (id: number, setData: (data: CategoryResponse) => void) => {
  return BaseAction(CategoryType.DETAIL_CATEGORY_REQUEST, {id, setData});
}

export const categoryUpdateAction = (id: number, request: UpdateCatergoryRequest,onUpdateSuccess: () => void) => {
  return BaseAction(CategoryType.UPDATE_CATEGORY_REQUEST, {id, request, onUpdateSuccess});
}

export const categoryDeleteAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(CategoryType.DELETE_CATEGORY_REQUEST, {id, onDeleteSuccess});
}