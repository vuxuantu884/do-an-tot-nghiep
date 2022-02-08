import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ImportProcument, ProcurementConfirm, ProcurementQuery, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { generateQuery } from "utils/AppUtils";

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
export const approvalPurchaseProcumentService = (
  poId: number,
  procumentId: number,
  data: PurchaseProcument
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/procurements/${procumentId}/approve`,
    data
  );
};
export const confirmPoProcumentService = (
  poId: number,
  procumentId: number,
  data: PurchaseProcument
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/procurements/${procumentId}/confirm`,
    data
  );
};
export const deletePurchaseProcumentService = (
  poId: number,
  procumentId: number
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.delete(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/procurements/${procumentId}`
  );
};

export const updateStatusPO = (
  poId: number,
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${poId}/receive-status/finish`
  );
};


export const searchProcurementApi = (
  query: ProcurementQuery
): Promise<BaseResponse<PageResponse<PurchaseProcument>>> => {
  const queryString = generateQuery(query); 
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/procurements?${queryString}`
  );
};

export const importProcumentApi = (
  data: ImportProcument
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/excel/job/import`,
    data
  );
}; 

export const getJobImport = (
  code: string
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/excel/job/${code}`);
};

export const getLogDetailProcurements = (
  poId: number
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/procurements/log/${poId}`);
}

export const getLogProcurements = (
  code: string
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/procurements/${code}/log`);
}

export const getProcurementsMerge = (
  ids: string
): Promise<BaseResponse<PurchaseProcument>> => {
  return BaseAxios.get(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/procurements/merge?ids=${ids}`);
}

export const confirmProcumentsMerge = (
  request: ProcurementConfirm
): Promise<BaseResponse<PurchaseProcument>> => {
  return BaseAxios.put(`${ApiConfig.PURCHASE_ORDER}/purchase-orders/procurements/merge/confirm`,request);
}