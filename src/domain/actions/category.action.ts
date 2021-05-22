import BaseAction from "base/BaseAction"
import { CategoryType } from "domain/types/product.type";
import { CategoryResponse } from "model/response/CategoryResponse";

export const getCategoryRequestAction = (code: string|null, created_name: string|null, goods: string|null, name: string|null, setData: (data: Array<CategoryResponse>) => void) => {
  return BaseAction(CategoryType.GET_CATEGORY_REQUEST, {code, created_name, goods, name, setData});
}

export const getCategorySuccessAction = () => {
  return BaseAction(CategoryType.GET_CATEGORY_SUCCESS, null);
}
