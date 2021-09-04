import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { InventoryQuery, InventoryResponse } from "model/inventory";
import { generateQuery } from "utils/AppUtils";

const inventoryGetApi = (query: InventoryQuery): Promise<BaseResponse<InventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories?${params}`;
  return BaseAxios.get(link);
}

export {inventoryGetApi};