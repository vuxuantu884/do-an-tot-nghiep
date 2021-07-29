import { SETTING_TYPES } from "domain/types/settings.type";
import {
  OrderSourceCompanyModel, OrderSourceModelResponse
} from "model/response/order/order-source.response";

export const actionFetchListOrderSources = (params = {}, handleData: (data: OrderSourceModelResponse) => void) => {
  return {
    type: SETTING_TYPES.orderSources.listData,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionFetchListOrderSourceCompanies = (
  handleData: (data: OrderSourceCompanyModel[]) => void
) => {
  return {
    type: SETTING_TYPES.orderSources.listSourceCompany,
    payload: {
      handleData,
    },
  };
};