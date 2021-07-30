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
  newItem: FulfillmentModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.fulfillment.add,
    payload: {
      newItem,
      handleData,
    },
  };
};
