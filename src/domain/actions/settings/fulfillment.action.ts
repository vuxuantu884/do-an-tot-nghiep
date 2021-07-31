import { SETTING_TYPES } from "domain/types/settings.type";
import {
  FulfillmentModel,
  FulfillmentResponseModel,
} from "model/response/fulfillment.response";

export const actionFetchListFulfillments = (
  params = {},
  handleData: (data: FulfillmentResponseModel) => void
) => {
  return {
    type: SETTING_TYPES.fulfillment.listData,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionAddFulfillments = (
  item: FulfillmentModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.fulfillment.create,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionDeleteFulfillment = (
  item: FulfillmentModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.fulfillment.delete,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionEditFulfillment = (
  id: number,
  item: FulfillmentModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.fulfillment.edit,
    payload: {
      id,
      item,
      handleData,
    },
  };
};
