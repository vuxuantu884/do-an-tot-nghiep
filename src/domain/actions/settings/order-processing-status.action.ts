import { SETTING_TYPES } from "domain/types/settings.type";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

export const actionFetchListOrderProcessingStatus = (
  queryParams = {},
  handleData: (data: OrderProcessingStatusResponseModel) => void,
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.listData,
    payload: {
      queryParams,
      handleData,
    },
  };
};

export const actionAddOrderProcessingStatus = (
  item: OrderProcessingStatusModel,
  handleData: () => void,
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.create,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionEditOrderProcessingStatus = (
  id: number,
  item: OrderProcessingStatusModel,
  handleData: () => void,
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.edit,
    payload: {
      id,
      item,
      handleData,
    },
  };
};

export const actionDeleteOrderProcessingStatus = (id: number, handleData: () => void) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.delete,
    payload: {
      id,
      handleData,
    },
  };
};
