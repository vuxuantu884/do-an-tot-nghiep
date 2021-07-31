import { SETTING_TYPES } from "domain/types/settings.type";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

export const actionFetchListOrderProcessingStatuss = (
  params = {},
  handleData: (data: OrderProcessingStatusResponseModel) => void
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.listData,
    payload: {
      params,
      handleData,
    },
  };
};

export const actionAddOrderProcessingStatuss = (
  item: OrderProcessingStatusModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.create,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionDeleteOrderProcessingStatus = (
  item: OrderProcessingStatusModel,
  handleData: () => void
) => {
  return {
    type: SETTING_TYPES.orderProcessingStatus.delete,
    payload: {
      item,
      handleData,
    },
  };
};

export const actionEditOrderProcessingStatus = (
  id: number,
  item: OrderProcessingStatusModel,
  handleData: () => void
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
