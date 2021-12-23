import {CustomerDuplicateModel} from "./../../model/order/duplicate.model";
import {generateQuery} from "utils/AppUtils";
import {ApiConfig} from "config/api.config";
import BaseAxios from "base/base.axios";
import {
  DuplicateOrderSearchQuery,
  OrderModel,
  OrderSearchQuery,
} from "./../../model/order/order.model";
import BaseResponse from "base/base.response";
import {PageResponse} from "model/base/base-metadata.response";

export const getOrderDuplicateService = (
  param: DuplicateOrderSearchQuery
): Promise<BaseResponse<PageResponse<CustomerDuplicateModel>>> => {
  const queryString = generateQuery(param);
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-duplicate?${queryString}`);
};

export const putOrderMergeService = (
  origin_id: number,
  ids: number[]
): Promise<BaseResponse<OrderModel>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders-duplicate/combination`,{origin_id:origin_id,ids:ids});
};

export const putOrderCancelService = (ids: number[]): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.ORDER}/orders-duplicate/cancel`,{ids:ids});
};

export const getDetailOrderDuplicateService = (
  query: OrderSearchQuery
): Promise<BaseResponse<OrderModel>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/orders-duplicate/detail?${queryString}`);
};
