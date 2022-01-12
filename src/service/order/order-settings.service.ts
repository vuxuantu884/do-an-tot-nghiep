import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  CreateShippingServiceConfigReQuestModel,
  OrderConfigRequestModel,
} from "model/request/settings/order-settings.resquest";
import { SourceResponse } from "model/response/order/source.response";
import {
  OrderConfigActionOrderPreviewResponseModel,
  OrderConfigPrintResponseModel,
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
  ShippingServiceConfigResponseModel,
} from "model/response/settings/order-settings.response";

/**
 * list Order Settings: Cho phép bán khi tồn kho <= 0
 */

export const getIsAllowToSellWhenNotAvailableStockService = (): Promise<
  BaseResponse<SourceResponse>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-config`);
};

export const configureIsAllowToSellWhenNotAvailableStockService = (
  sellable_inventory: boolean
): Promise<BaseResponse<string>> => {
  let params = {
    sellable_inventory,
  };
  return BaseAxios.put(`${ApiConfig.ORDER}/orders-config`, params);
};

export const getOrderConfigService = (): Promise<
  BaseResponse<OrderConfigResponseModel>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-config`);
  // return BaseAxios.get(`https://uat.api.yody.io/unicorn/order-service/orders-config`);
};

export const getOrderConfigPrintService = (): Promise<
  BaseResponse<OrderConfigPrintResponseModel>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-config-sprint`);
};

export const getOrderConfigActionService = (): Promise<
  BaseResponse<OrderConfigActionOrderPreviewResponseModel>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-config-action`);
};

export const editOrderConfigActionService = (
  params: OrderConfigRequestModel
): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders-config`, params);
};

/**
 * list Order Settings: CÀI ĐẶT DỊCH VỤ VẬN CHUYỂN VÀ PHÍ SHIP BÁO KHÁCH
 */

export const getListShippingServiceConfigService = (): Promise<
  BaseResponse<ShippingServiceConfigResponseModel[]>
> => {
  return BaseAxios.get(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-service-config`);
};

export const createListShippingServiceConfigService = (
  params: CreateShippingServiceConfigReQuestModel
): Promise<BaseResponse<ShippingServiceConfigResponseModel[]>> => {
  return BaseAxios.post(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-service-config`, params);
};

export const getShippingServiceConfigDetailService = (
  id: number
): Promise<BaseResponse<ShippingServiceConfigDetailResponseModel>> => {
  return BaseAxios.get(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-service-config/${id}`);
};

export const updateShippingServiceConfigService = (
  id: number,
  params: CreateShippingServiceConfigReQuestModel
): Promise<BaseResponse<ShippingServiceConfigDetailResponseModel>> => {
  return BaseAxios.put(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-service-config/${id}`, params);
};

export const deleteShippingServiceConfigService = (
  id: number
): Promise<BaseResponse<ShippingServiceConfigDetailResponseModel>> => {
  return BaseAxios.delete(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-service-config/${id}`);
};
