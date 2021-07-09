import BaseAxios from "base/BaseAxios"
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig"
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from 'model/base/base-metadata.response';
import { ProductRequest, VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { ProductUploadModel } from "model/product/product-upload.model";



export const searchVariantsApi = (query: VariantSearchQuery): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
    const queryString = generateQuery(query);
    return BaseAxios.get(`${ApiConfig.PRODUCT}/variants?${queryString}`);
  }


export const getVariantApi = (id: string): Promise<BaseResponse<VariantResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/${id}`);
}

export const productUploadApi = (files: Array<File>, folder: string): Promise<BaseResponse<Array<ProductUploadModel>>> => {
  let body = new FormData();
  body.append('folder', folder);
  files.forEach((item) => {
    body.append('file_upload', item)
  })
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products/upload`, body, {headers:  {"content-type": "multipart/form-data"}});
}

export const createProductApi= (request: ProductRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products`, request);
}
