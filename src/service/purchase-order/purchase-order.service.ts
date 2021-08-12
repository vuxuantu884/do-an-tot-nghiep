import { PurchaseOrderQuery } from "./../../model/purchase-order/purchase-order.model";
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";

export const createPurchaseOrder = (
  data: PurchaseOrder
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.post(`${ApiConfig.PURCHASE_ORDER}/purchase-orders`, data);
};

export const updatePurchaseOrder = (
  id: number,
  data: PurchaseOrder
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}`,
    data
  );
};

export const updatePurchaseOrderFinancialStatus = (
  id: number,
  financialstatus: string
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/financial-status/${financialstatus}`
  );
};

export const searchPurchaseOrderApi = (
  query: PurchaseOrderQuery
): Promise<BaseResponse<PageResponse<PurchaseOrderQuery>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders?${queryString}`
  );
};
export const getPurchaseOrderApi = (
  id: string
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}`);
};
