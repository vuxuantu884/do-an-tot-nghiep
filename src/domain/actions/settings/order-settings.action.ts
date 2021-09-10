import { SETTING_TYPES } from "domain/types/settings.type";
import { OrderSourceResponseModel } from "model/response/order/order-source.response";
import {
  IsAllowToSellWhenNotAvailableStockResponseModel,
  ShippingServiceConfigResponseModel,
} from "model/response/settings/order-settings.response";

export const actionGetIsAllowToSellWhenNotAvailableStock = (
  handleData: (data: IsAllowToSellWhenNotAvailableStockResponseModel) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .GET_IS_ALLOW_TO_SELL_WHEN_NOT_AVAILABLE_STOCK,
    payload: {
      handleData,
    },
  };
};

export const actionConfigureIsAllowToSellWhenNotAvailableStock = (
  sellable_inventory: boolean,
  handleData: (data: OrderSourceResponseModel) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .CONFIGURE_IS_ALLOW_TO_SELL_WHEN_NOT_AVAILABLE_STOCK,
    payload: {
      sellable_inventory,
      handleData,
    },
  };
};

export const actionListConfigurationShippingServiceAndShippingFee = (
  handleData: (data: ShippingServiceConfigResponseModel[]) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .LIST_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    payload: {
      handleData,
    },
  };
};
