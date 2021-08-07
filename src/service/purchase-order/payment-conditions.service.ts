
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

export const getPaymentConditionsrApi = (
): Promise<BaseResponse<Array<PoPaymentConditions>>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/payment-conditions`);
};
