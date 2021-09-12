import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductHistoryQuery,
  ProductHistoryResponse,
  ProductRequest,
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";
import { ProductUploadModel } from "model/product/product-upload.model";

export const searchVariantsApi = (
  query: VariantSearchQuery
): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants?${queryString}`);
};

export const getVariantApi = (
  id: string
): Promise<BaseResponse<VariantResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/variants/${id}`);
};

export const productUploadApi = (
  files: Array<File>,
  folder: string
): Promise<BaseResponse<Array<ProductUploadModel>>> => {
  let body = new FormData();
  body.append("folder", folder);
  files.forEach((item) => {
    body.append("file_upload", item);
  });
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products/upload`, body, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const createProductApi = (request: ProductRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/products`, request);
};


export const productGetHistory = (query: ProductHistoryQuery): Promise<BaseResponse<PageResponse<ProductHistoryResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products/history?${queryString}`);
};

export const productDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products/${id}`);
}