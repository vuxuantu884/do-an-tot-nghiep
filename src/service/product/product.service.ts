import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from 'model/base/base-metadata.response';
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";



export const searchVariantsApi = (query: VariantSearchQuery): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
    const queryString = generateQuery(query);
    return BaseAxios.get(`${ApiConfig.PRODUCT}/variants?${queryString}`);
  }


export const getVariantApi = (id: string) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/variants/${id}`);
}

export const productUploadApi = (id: string) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/products/upload`);
}

