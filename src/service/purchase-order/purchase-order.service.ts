import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  PurchaseOrder,
  PurchaseOrderPrint,
} from "model/purchase-order/purchase-order.model";
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
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/financial-status/finish`
  );
};

export const deletePurchaseOrder = (
  id: number
): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}`);
};

export const returnPurchaseOrder = (
  id: number,
  data: PurchaseOrder
): Promise<BaseResponse<string>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/return`,
    data
  );
};

export const getPrintContent = (
  id: number
): Promise<Array<PurchaseOrderPrint>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/orders/print_forms?ids=${id}`
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


export const cancelPurchaseOrderApi = (
  id: string
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/cancel`);
};
