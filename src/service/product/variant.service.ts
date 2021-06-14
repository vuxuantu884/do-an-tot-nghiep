import { VariantResponse } from './../../model/response/products/variant.response';
import { ListDataModel } from '../../model/other/list-data-model';
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";

const getVariants = (page: number, limit: number, search: string): Promise<BaseResponse<ListDataModel<VariantResponse>>> => {
  let link = `${ApiConfig.PRODUCT}/variants?page=${page}&limit=${limit}&info=${search}`;
  return BaseAxios.get(link);
};

const getVariantByBarcode = (barcode: string): Promise<BaseResponse<VariantResponse>> => {
  let link = `${ApiConfig.PRODUCT}/variants/barcode/${barcode}`;
  return BaseAxios.get(link);
};

export {getVariants, getVariantByBarcode};