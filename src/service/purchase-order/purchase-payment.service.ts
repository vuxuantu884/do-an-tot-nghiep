import { PurchasePayments } from "model/purchase-order/purchase-payment.model";

import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/ApiConfig";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

export const createPurchasePaymentService = (
  poId: number,
  data: PurchasePayments
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/payments`,
    data
  );
};

export const updatePurchasePaymentService = (
  poId: number,
  paymentId: number,
  data: PurchasePayments
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/payments/${paymentId}`,
    data
  );
};
