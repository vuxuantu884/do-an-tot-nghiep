import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";

const getVariants = (page: number, limit: number, search: string): Promise<BaseResponse<PageResponse<VariantResponse>>> => {
  let link = `${ApiConfig.PRODUCT}/variants?page=${page}&limit=${limit}&info=${search}`;
  return BaseAxios.get(link);
};

const getVariantByBarcode = (barcode: string): Promise<BaseResponse<VariantResponse>> => {
  let link = `${ApiConfig.PRODUCT}/variants/barcode/${barcode}`;
  return BaseAxios.get(link);
};

export {getVariants, getVariantByBarcode};