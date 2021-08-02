import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { BaseQuery } from "model/base/base.query";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";
import { SourceResponse } from "model/response/order/source.response";
import { generateQuery } from "utils/AppUtils";

/**
 * list Order Processing Status: Xử lý đơn hàng
 */

export const getOrderProcessingStatusService = (
  query: BaseQuery
): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/subStatus?${queryString}`);
};

export const createOrderProcessingStatusService = (
  newOrderProcessingStatus: OrderProcessingStatusModel
): Promise<BaseResponse<OrderProcessingStatusResponseModel>> => {
  return BaseAxios.post(
    `${ApiConfig.ORDER}/subStatus`,
    newOrderProcessingStatus
  );
};

export const editOrderProcessingStatusService = (
  id: number,
  OrderProcessingStatus: OrderProcessingStatusModel
): Promise<BaseResponse<OrderProcessingStatusResponseModel>> => {
  return BaseAxios.put(
    `${ApiConfig.ORDER}/subStatus/${id}`,
    OrderProcessingStatus
  );
};

export const deleteOrderProcessingStatusService = (
  id: number
): Promise<BaseResponse<OrderProcessingStatusResponseModel>> => {
  return BaseAxios.delete(`${ApiConfig.ORDER}/subStatus/${id}`);
};
