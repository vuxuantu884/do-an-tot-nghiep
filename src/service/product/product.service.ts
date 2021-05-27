import { VariantResponse } from './../../model/response/products/variant.response';
import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { isUndefinedOrNull } from "utils/AppUtils";

export const searchVariantsApi = (info: string, barcode: string): Promise<BaseResponse<Array<VariantResponse>>> => {
  let params = '?';
  if(!isUndefinedOrNull(info)) {
    params = params + `&info=${info}`
  }
 
  if(!isUndefinedOrNull(barcode)) {
    params = params + `&barcode=${barcode}`
  }
  
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants${params}`)
}

export const getVariantApi = (id: string) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/variants/${id}`);
}