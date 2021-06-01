import { SizeResponse } from './../../model/response/products/size.response';
import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"

export const getAllSizeApi = (): Promise<BaseResponse<Array<SizeResponse>>> => {
    return BaseAxios.get(`${ApiConfig.PRODUCT}/sizes`);
  }

