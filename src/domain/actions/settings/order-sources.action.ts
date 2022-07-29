import { SETTING_TYPES } from "domain/types/settings.type";
import {
  OrderSourceCompanyModel,
  OrderSourceModel,
  OrderSourceResponseModel,
} from "model/response/order/order-source.response";

export const actionFetchListOrderSources = (
  queryParams = {},
  handleData: (data: OrderSourceResponseModel) => void,
) => {
  return {
    type: SETTING_TYPES.orderSources.listData,
    payload: {
      queryParams,
      handleData,
    },
  };
};

export const actionFetchListOrderSourceCompanies = (
  handleData: (data: OrderSourceCompanyModel[]) => void,
) => {
  return {
    type: SETTING_TYPES.orderSources.listSourceCompany,
    payload: {
      handleData,
    },
  };
};

export const actionAddOrderSource = (item: OrderSourceModel, handleData: () => void) => {
  return {
    type: SETTING_TYPES.orderSources.create,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionEditOrderSource = (
  id: number,
  item: OrderSourceModel,
  handleData: () => void,
) => {
  return {
    type: SETTING_TYPES.orderSources.edit,
    payload: {
      id,
      item,
      handleData,
    },
  };
};

export const actionDeleteOrderSource = (id: number, handleData: () => void) => {
  return {
    type: SETTING_TYPES.orderSources.delete,
    payload: {
      id,
      handleData,
    },
  };
};
