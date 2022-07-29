import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

export const getPaymentConditionsrApi = (): Promise<BaseResponse<Array<PoPaymentConditions>>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/payment-conditions`);
};
