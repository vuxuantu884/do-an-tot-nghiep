import { SETTING_TYPES } from "domain/types/settings.type";

export const actionFetchList = (params = {}) => {
  return {
    type: SETTING_TYPES.fulfillment.listAll,
    payload: {
      params,
    },
  };
}

export const actionFetchListSuccessful = (data: any) => {
  return {
    type: SETTING_TYPES.fulfillment.listAllSuccessful,
    payload: {
      data,
    },
  };
};

export const actionFetchListFailed = (error:any) => {
  return {
    type: SETTING_TYPES.fulfillment.listAllFailed,
    payload: {
      error,
    },
  };
};