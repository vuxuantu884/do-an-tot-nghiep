import BaseAction from "base/base.action"
import { InventoryType } from "domain/types/inventory.type"
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryQuery, InventoryResponse } from "model/inventory";

const inventoryGetListAction = (query: InventoryQuery, onResult: (data: PageResponse<InventoryResponse>|false) => void) => {
  return BaseAction(InventoryType.GET, {query, onResult})
}

export {inventoryGetListAction};