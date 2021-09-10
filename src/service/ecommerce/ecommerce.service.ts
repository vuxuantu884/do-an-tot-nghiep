import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { EcommerceRequest } from "model/request/ecommerce.request";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";

const ecommerceCreateApi = (
  EcommerceConfig: EcommerceRequest
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops`;
  return BaseAxios.post(link, EcommerceConfig);
};

const ecommerceUpdateApi = (
  id: number,
  EcommerceConfig: EcommerceRequest
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.put(link, EcommerceConfig);
};

const ecommerceGetApi = (): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops`;
  return BaseAxios.get(link);
};

const ecommerceGetByIdApi = (
  id: number
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.get(link);
};

const ecommerceDeleteApi = (
  id: number
): Promise<BaseResponse<EcommerceResponse>> => {
  let link = `${ApiConfig.ECOMMERCE}/shops/${id}`;
  return BaseAxios.delete(link);
};

export {
  ecommerceCreateApi,
  ecommerceGetApi,
  ecommerceGetByIdApi,
  ecommerceUpdateApi,
  ecommerceDeleteApi,
};
