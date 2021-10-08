import { SETTING_TYPES } from "domain/types/settings.type";
import { CreateShippingServiceConfigReQuestModel } from "model/request/settings/order-settings.resquest";
import { OrderSourceResponseModel } from "model/response/order/order-source.response";
import {
  IsAllowToSellWhenNotAvailableStockResponseModel,
  ShippingServiceConfigDetailResponseModel,
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
  handleData: (data: ShippingServiceConfigDetailResponseModel[]) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .LIST_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    payload: {
      handleData,
    },
  };
};

export const actionCreateConfigurationShippingServiceAndShippingFee = (
  params: CreateShippingServiceConfigReQuestModel,
  handleData: (data: ShippingServiceConfigResponseModel[]) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .CREATE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionGetConfigurationShippingServiceAndShippingFeeDetail = (
  id: number,
  handleData: (data: ShippingServiceConfigDetailResponseModel) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .GET_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE_DETAIL,
    payload: {
      id,
      handleData,
    },
  };
};

export const actionUpdateConfigurationShippingServiceAndShippingFee = (
  id: number,
  params: CreateShippingServiceConfigReQuestModel,
  handleData: (data: ShippingServiceConfigResponseModel[]) => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .UPDATE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    payload: {
      id,
      params,
      handleData,
    },
  };
};

export const actionDeleteConfigurationShippingServiceAndShippingFee = (
  id: number,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.orderSettings
      .DELETE_CONFIGURATION_SHIPPING_SERVICE_AND_SHIPPING_FEE,
    payload: {
      id,
      handleData,
    },
  };
};
