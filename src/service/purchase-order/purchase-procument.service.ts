import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";

export const createPurchaseProcumentService = (
  poId: number,
  data: PurchaseProcument
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/procurements`,
    data
  );
};

export const updatePurchaseProcumentService = (
  poId: number,
  procumentId: number,
  data: PurchaseProcument
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/procurements/${procumentId}`,
    data
  );
};
