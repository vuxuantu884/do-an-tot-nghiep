import BaseAxios from "base/base.axios"
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config"
import { PageResponse } from "model/base/base-metadata.response";
import { CollectionQuery, CollectionUpdateRequest, CollectionCreateRequest, CollectionResponse } from "model/product/collection.model";
import { ProductWrapperResponse, ProductWrapperSearchQuery } from "model/product/product.model";
import { generateQuery } from "utils/AppUtils";

export const getCollectionApi = (query: CollectionQuery): Promise<BaseResponse<Array<CollectionResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/collections?${params}`)
}

export const updateCollectionApi = (id: string, request: CollectionUpdateRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/collections/${id}`, request);
}

export const collectionDetailApi = (id: number): Promise<BaseResponse<CollectionResponse>> => {
  return BaseAxios.get(`${ApiConfig.PRODUCT}/collections/${id}`);
}

export const createCollectionApi = (request: CollectionCreateRequest) => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/collections`, request);
}

export const collectionDeleteApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/collections/${id}`);
}

export const collectionDeleteProductApi = (id: number, productId: number): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PRODUCT}/collections/${id}/product/${productId}`);
}

export const collectionUpdateProductsApi = (request: CollectionUpdateRequest): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/products/collections`,request);
}

export const getProductsCollectionApi = (query: ProductWrapperSearchQuery): Promise<BaseResponse<PageResponse<ProductWrapperResponse>>> => {
  const queryParams = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/products?${queryParams}`);
}
