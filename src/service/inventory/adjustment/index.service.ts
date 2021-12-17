import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config"; 
import { generateQuery } from "utils/AppUtils"; 
import { InventoryAdjustmentDetailItem, InventoryAdjustmentSearchQuery, LineItemAdjustment } from "model/inventoryadjustment";
import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";

export const getListInventoryAdjustmentApi = (
  query: InventoryAdjustmentSearchQuery
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment?${queryString}`);
};

export const getDetailInventorAdjustmentGetApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`);
}
  
export const createInventorAdjustmentGetApi = (
  data: InventoryAdjustmentDetailItem
): Promise<BaseResponse<string>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment`, data);
}

export const updateItemOnlineInventoryApi = (
  id: number,
  data: LineItemAdjustment
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item`, data);
}

export const updateOnlineInventoryApi = (
  id: number
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/audit/${id}`);
}

export const adjustInventoryApi = (
  id: number
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/adjust/${id}`);
}

export const getPrintTicketIdsService = (
  queryPrint: string
): Promise<Array<PrinterInventoryTransferResponseModel>> => {  
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/print_forms?${queryPrint}`);
};

export const getLinesItemAdjustmentApi = (
  id: number,
  queryString: string | null
  ): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}/lines-item?${queryString}`);
};

export const updateInventorAdjustmentApi = (
  id: number,
  data: InventoryAdjustmentDetailItem
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_ADJUSTMENT}/inventory-adjustment/${id}`, data);
}

