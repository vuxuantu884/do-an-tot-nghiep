import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { CategoryResponse } from "model/response/CategoryResponse";
import { isUndefinedOrNull } from "utils/AppUtils";

export const getCategoryApi = (code: string, created_name: string, goods: string, name: string): Promise<BaseResponse<Array<CategoryResponse>>> => {
  let params = '?';
  if(!isUndefinedOrNull(code)) {
    params = params + `&code=${code}`
  }
  if(!isUndefinedOrNull(created_name)) {
    params = params + `&created_name=${created_name}`
  }
  if(!isUndefinedOrNull(goods)) {
    params = params + `&goods=${goods}`
  }
  if(!isUndefinedOrNull(name)) {
    params = params + `&name=${name}`
  }
  return BaseAxios.get(`${ApiConfig.PRODUCT}/categories${params}`)
}

export const updateCategoryApi = (id: string) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/categories/${id}`);
}