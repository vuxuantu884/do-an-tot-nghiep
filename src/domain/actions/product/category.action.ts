import BaseAction from "base/base.action";
import { CategoryType } from "domain/types/product.type";
import {
  CategoryQuery,
  CategoryResponse,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from "model/product/category.model";

export const getCategoryRequestAction = (
  query: CategoryQuery,
  setData: (data: Array<CategoryResponse>) => void,
) => {
  return BaseAction(CategoryType.GET_CATEGORY_REQUEST, { query, setData });
};

export const createCategoryAction = (
  request: CategoryCreateRequest,
  onCreateSuccess: (result: CategoryResponse) => void,
) => {
  return BaseAction(CategoryType.CREATE_CATEGORY_REQUEST, {
    request,
    onCreateSuccess,
  });
};

export const categoryDetailAction = (
  id: number,
  setData: (data: false | CategoryResponse) => void,
) => {
  return BaseAction(CategoryType.DETAIL_CATEGORY_REQUEST, { id, setData });
};

export const categoryUpdateAction = (
  id: number,
  request: CategoryUpdateRequest,
  onUpdateSuccess: (result: CategoryResponse) => void,
) => {
  return BaseAction(CategoryType.UPDATE_CATEGORY_REQUEST, {
    id,
    request,
    onUpdateSuccess,
  });
};

export const categoryDeleteAction = (id: number, onDeleteSuccess: () => void) => {
  return BaseAction(CategoryType.DELETE_CATEGORY_REQUEST, {
    id,
    onDeleteSuccess,
  });
};
