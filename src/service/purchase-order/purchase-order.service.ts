import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

export const createPurchaseOrder = (
  data: PurchaseOrder
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.post(`${ApiConfig.PURCHASE_ORDER}/purchase-orders`, data);
};
