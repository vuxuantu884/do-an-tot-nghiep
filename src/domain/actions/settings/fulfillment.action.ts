import BaseAction from "base/BaseAction";
import BaseResponse from "base/BaseResponse";
import { AppType } from "domain/types/app.type";
import { SETTING_TYPES } from "domain/types/settings.type";
import { CategoryResponse } from "model/product/category.model";

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