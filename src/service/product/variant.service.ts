import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse, VariantUpdateRequest } from "model/product/product.model";

export const getVariants = (page: number, limit: number, search: string): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  let link = `${ApiConfig.PRODUCT}/variants?page=${page}&limit=${limit}&info=${search}`;
  return BaseAxios.get(link);
};

export const getVariantByBarcode = (barcode: string): Promise<BaseResponse<VariantResponse>> => {
  let link = `${ApiConfig.PRODUCT}/variants/barcode/${barcode}`;
  return BaseAxios.get(link);
};

export const updateVariantApi = (id: string, request: VariantUpdateRequest) => {
  return BaseAxios.put(`${ApiConfig.PRODUCT}/products/${request.product_id}/variants/${id}`, request);
}




// export {getVariants, getVariantByBarcode};