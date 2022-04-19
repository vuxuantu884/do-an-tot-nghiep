import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {generateQuery} from "utils/AppUtils";
import {
  InventoryAdjustmentDetailItem,
  InventoryAdjustmentSearchQuery,
  LineItemAdjustment,
} from "model/inventoryadjustment";
import {PrinterInventoryTransferResponseModel} from "model/response/printer.response";
import {VariantResponse} from "model/product/product.model";
import { InventoryQuery } from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";

const getListInventoryAdjustmentApi = (
  query: InventoryAdjustmentSearchQuery
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment?${queryString}`
  );
};

const getDetailInventorAdjustmentGetApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`);
};

const createInventorAdjustmentGetApi = (
  data: InventoryAdjustmentDetailItem
): Promise<BaseResponse<string>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment`, data);
};

const updateItemOnlineInventoryApi = (
  id: number,
  data: LineItemAdjustment
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item`,
    data
  );
};

const updateOnlineInventoryApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/audit/${id}`
  );
};

const updateReasonItemOnlineInventoryApi = (
  id: number,
  lineId: number,
  data: LineItemAdjustment
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item/${lineId}/update-note`,
    data
  );
};


const adjustInventoryApi = (id: number): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/adjust/${id}`
  );
};

const getPrintTicketIdsService = (
  queryPrint: string
): Promise<Array<PrinterInventoryTransferResponseModel>> => {
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/print_forms?${queryPrint}`
  );
};

const getLinesItemAdjustmentApi = (
  id: number,
  queryString: string | null
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item?${queryString}`
  );
};

const updateInventorAdjustmentApi = (
  id: number,
  data: InventoryAdjustmentDetailItem
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`,
    data
  );
};

const getVariantHasOnHandByStoreApi = (
  query: InventoryQuery
): Promise<PageResponse<VariantResponse>> => {
  let params = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.INVENTORY}/inventories/detail?${params}`
  );
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
  updateReasonItemOnlineInventoryApi
};
