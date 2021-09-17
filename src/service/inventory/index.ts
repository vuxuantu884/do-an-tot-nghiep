import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { AllInventoryResponse, HistoryInventoryQuery, HistoryInventoryResponse, InventoryQuery, InventoryResponse } from "model/inventory";
import { generateQuery } from "utils/AppUtils";

const inventoryGetApi = (query: InventoryQuery): Promise<BaseResponse<AllInventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories?${params}`;
  return BaseAxios.get(link);
}

const inventoryGetDetailApi = (query: InventoryQuery): Promise<BaseResponse<InventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories/detail?${params}`;
  return BaseAxios.get(link);
}

const inventoryGetHistoryApi = (query: HistoryInventoryQuery): Promise<BaseResponse<HistoryInventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories/history?${params}`;
  return BaseAxios.get(link);
}

export {inventoryGetApi, inventoryGetDetailApi, inventoryGetHistoryApi};