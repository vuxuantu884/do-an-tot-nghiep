import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { SpecialOrderModel } from "model/order/special-order.model";
import { OrderResponse } from "model/response/order/order.response";

export const specialOrderServices = {
  createOrUpdate: (
    orderId: number | string,
    query: SpecialOrderModel,
  ): Promise<BaseResponse<OrderResponse>> => {
    return BaseAxios.post(`${ApiConfig.ORDER}/orders/${orderId}/special`, query);
  },

  delete: (orderId: number | string): Promise<BaseResponse<OrderResponse>> => {
    return BaseAxios.delete(`${ApiConfig.ORDER}/orders/${orderId}/special`);
  },
};
