import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import { generateQuery } from "utils/AppUtils";
import {
  DataAddAttachedFile,
  DownloadAttachedFile,
  InventoryAdjustmentDetailItem,
  InventoryAdjustmentSearchQuery,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";
import { VariantResponse } from "model/product/product.model";
import { InventoryQuery } from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";

const getListInventoryAdjustmentApi = (
  query: InventoryAdjustmentSearchQuery,
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment?${queryString}`);
};

const getDetailInventorAdjustmentGetApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`);
};

const createInventorAdjustmentGetApi = (
  data: InventoryAdjustmentDetailItem,
): Promise<BaseResponse<string>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment`, data);
};

const addLineItem = (adjustmentId: number, data: any): Promise<BaseResponse<string>> => {
  let link = `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${adjustmentId}/lines-item`;
  return BaseAxios.post(link, data);
};

const getTotalOnHand = (adjustmentId: number): Promise<BaseResponse<string>> => {
  let link = `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${adjustmentId}/lines-item/total-on-hand`;
  return BaseAxios.get(link);
};

const updateItemOnlineInventoryApi = (
  id: number,
  lineId: number,
  data: LineItemAdjustment,
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item/${lineId}`,
    data,
  );
};

const updateReasonItemOnlineInventoryApi = (
  id: number,
  lineId: number,
  data: LineItemAdjustment,
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item/${lineId}/update-note`,
    data,
  );
};

const updateOnHandItemOnlineInventoryApi = (
  id: number,
  lineId: number,
  data: any,
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item/${lineId}/update-on-hand`,
    data,
  );
};

const updateOnlineInventoryApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/audit/${id}`);
};

const cancelInventoryTicket = (id?: number): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/cancel`);
};

const adjustInventoryApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/adjust/${id}`);
};

const getPrintTicketIdsService = (
  queryPrint: string,
): Promise<Array<PrinterInventoryTransferResponseModel>> => {
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/print_forms?${queryPrint}`,
  );
};

const getPrintProductService = (
  id: number,
  queryPrint: string
): Promise<Array<PrinterInventoryTransferResponseModel>> => {
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/print?${queryPrint}`
  );
};

const getLinesItemAdjustmentApi = (
  id: number,
  queryString: string | null,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item?${queryString}`,
  );
};

const updateInventorAdjustmentApi = (
  id: number,
  data: InventoryAdjustmentDetailItem,
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`, data);
};

const getVariantHasOnHandByStoreApi = (
  query: InventoryQuery,
): Promise<PageResponse<VariantResponse>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY}/inventories/detail?${params}`);
};

const getInventoryReportApi = (id: number | null): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/report`);
};

const checkIncurredRecordApi = (id?: number): Promise<BaseResponse<string>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/intervening-transaction`);
};

const addAttachedFile = (adjustmentId: number | undefined, data: DataAddAttachedFile): Promise<BaseResponse<InventoryAdjustmentDetailItem>> => {
  let link = `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${adjustmentId}/attached-file`;
  return BaseAxios.post(link, data);
};

const updateAttachedFile = (adjustmentId: number | undefined, data: DataAddAttachedFile, fileId: number): Promise<BaseResponse<string>> => {
  let link = `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${adjustmentId}/attached-file/${fileId}`;
  return BaseAxios.put(link, data);
};

const renameAttachedFileApi = (params: DownloadAttachedFile): Promise<BaseResponse<string>> => {
  let link = `${ApiConfig.CORE}/file`;
  return BaseAxios.get(link, { params });
};

const deleteAttachedFile = (adjustmentId: number | undefined, fileId: number | null): Promise<BaseResponse<string>> => {
  let link = `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${adjustmentId}/attached-file/${fileId}`;
  return BaseAxios.delete(link);
};

export {
  getListInventoryAdjustmentApi,
  getDetailInventorAdjustmentGetApi,
  createInventorAdjustmentGetApi,
  updateItemOnlineInventoryApi,
  updateOnlineInventoryApi,
  adjustInventoryApi,
  getPrintTicketIdsService,
  getLinesItemAdjustmentApi,
  updateInventorAdjustmentApi,
  getVariantHasOnHandByStoreApi,
  addLineItem,
  getTotalOnHand,
  updateReasonItemOnlineInventoryApi,
  updateOnHandItemOnlineInventoryApi,
  cancelInventoryTicket,
  getPrintProductService,
  getInventoryReportApi,
  checkIncurredRecordApi,
  addAttachedFile,
  updateAttachedFile,
  deleteAttachedFile,
  renameAttachedFileApi
};
