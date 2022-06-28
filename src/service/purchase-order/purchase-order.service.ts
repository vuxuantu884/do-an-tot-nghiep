import { POStampPrinting, ProcumentLogQuery, PurchaseOrderBySupplierQuery, PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  PurchaseOrder,
  PurchaseOrderPrint,
} from "model/purchase-order/purchase-order.model";
import { PageResponse } from "model/base/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import { ImportProcument } from "model/purchase-order/purchase-procument";
import {ImportResponse } from "model/other/files/export-model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";

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

export const updateNotePurchaseOrder = (
  id: number,
  data: PurchaseOrder
): Promise<BaseResponse<PurchaseOrder>> => {
  return BaseAxios.put(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/${id}/notes`,
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
  ids: string
): Promise<BaseResponse<string>> => {
  return BaseAxios.delete(`${ApiConfig.PURCHASE_ORDER}/purchase-orders?ids=${ids}`);
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
  id: number,
  printType: string
): Promise<Array<PurchaseOrderPrint>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/print-forms?ids=${id}&print_type=${printType}`
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

export const exportPOApi = (
  data: ImportProcument
): Promise<BaseResponse<ImportResponse>| false> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/excel/job/export`,
    data
  );
};

export const createPurchaseOrderConfigService = (
  request: FilterConfigRequest
): Promise<BaseResponse<FilterConfig>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/config`,
      request
  );
};

export const updatePurchaseOrderConfigService = (
  request: FilterConfigRequest
): Promise<BaseResponse<FilterConfig>> => {
  return BaseAxios.post(
    `${ApiConfig.PURCHASE_ORDER}/config`,
      request
  );
};

export const getPurchaseOrderConfigService = (
  code: string
): Promise<BaseResponse<Array<FilterConfig>>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/config/${code}`,
  );
};

export const deletePurchaseOrderConfigService = (
  id: number
): Promise<BaseResponse<Array<FilterConfig>>> => {
  return BaseAxios.delete(
    `${ApiConfig.PURCHASE_ORDER}/config/${id}`,
  );
};

export const getProcumentLogsService = (
  query: ProcumentLogQuery
): Promise<BaseResponse<PageResponse<PurchaseOrderActionLogResponse>>> => {

  let params = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/procurements/logs?${params}`,
  );
};

export const listPurchaseOrderApi = (
  query: PurchaseOrderQuery
): Promise<BaseResponse<PageResponse<PurchaseOrderQuery>>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/list?ids=${query.ids}`
  );
};

export const listPurchaseOrderBySupplier = (id: number, query?: PurchaseOrderBySupplierQuery): Promise<BaseResponse<Array<PurchaseOrder>>> => {
  const params = generateQuery(query)
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/list-by-supplier/${id}?${params}`
  );
}

// export const printProcurementApi = (
//   id: number,
//   poId: number,
// ): Promise<Array<PurchaseOrderPrint>> => {
//   return BaseAxios.get(
//     `${ApiConfig.PURCHASE_ORDER}/purchase-orders/print-procurement?id=${id}&poId=${poId}`
//   );
// };

export const printMultipleProcurementApi = (
  ids: string,
): Promise<Array<PurchaseOrderPrint>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/print-procurement?ids=${ids}`
  );
};

export const printVariantBarcodeByPOApi = (params: POStampPrinting): Promise<BaseResponse<string>> => {
  return BaseAxios.post(`${ApiConfig.PRODUCT}/variants/print`, params);
}

export const printPurchaseOrderReturnApi = (
  id: number,
  poId: number,
): Promise<Array<PurchaseOrderPrint>> => {
  return BaseAxios.get(
    `${ApiConfig.PURCHASE_ORDER}/purchase-orders/print-purchase-order-return?id=${id}&poId=${poId}`
  );
};