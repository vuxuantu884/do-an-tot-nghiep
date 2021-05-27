import BaseAction from "base/BaseAction"
import { CategoryType } from "domain/types/category.type";
import { CategoryView } from "model/other/category-view";

export const getCategoryRequestAction = (code: string|null, created_name: string|null, goods: string|null, name: string|null, setData: (data: Array<CategoryView>) => void) => {
  return BaseAction(CategoryType.GET_CATEGORY_REQUEST, {code, created_name, goods, name, setData});
}

export const getCategorySuccessAction = () => {
  return BaseAction(CategoryType.GET_CATEGORY_SUCCESS, null);
}
