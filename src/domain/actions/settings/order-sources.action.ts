import { SETTING_TYPES } from "domain/types/settings.type";

export const actionFetchListOrderSources = (params = {}) => {
  return {
    type: SETTING_TYPES.orderSources.listAll,
    payload: {
      params,
    },
  };
}

export const actionFetchListOrderSourcesSuccessful = (data: any) => {
  return {
    type: SETTING_TYPES.orderSources.listAllSuccessful,
    payload: {
      data,
    },
  };
};

export const actionFetchListOrderSourcesFailed = (error:any) => {
  return {
    type: SETTING_TYPES.orderSources.listAllFailed,
    payload: {
      error,
    },
  };
};