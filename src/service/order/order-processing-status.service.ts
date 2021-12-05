import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
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
  queryParams: BaseQuery
): Promise<BaseResponse<SourceResponse>> => {
  const queryString = generateQuery(queryParams);
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