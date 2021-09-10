import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { CreateShippingServiceConfigReQuestModel } from "model/request/settings/order-settings.resquest";
import { SourceResponse } from "model/response/order/source.response";
import { ShippingServiceConfigResponseModel } from "model/response/settings/order-settings.response";

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

/**
 * list Order Settings: CÀI ĐẶT DỊCH VỤ VẬN CHUYỂN VÀ PHÍ SHIP BÁO KHÁCH
 */

export const getListShippingServiceConfigService = (): Promise<
  BaseResponse<ShippingServiceConfigResponseModel[]>
> => {
  return BaseAxios.get(`${ApiConfig.ORDER}/shipping-service-config`);
};

export const createListShippingServiceConfigService = (
  params: CreateShippingServiceConfigReQuestModel
): Promise<BaseResponse<ShippingServiceConfigResponseModel[]>> => {
  return BaseAxios.post(`${ApiConfig.ORDER}/shipping-service-config`, params);
};
