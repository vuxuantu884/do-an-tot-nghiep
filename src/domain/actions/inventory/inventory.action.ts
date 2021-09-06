import BaseAction from "base/base.action"
import { InventoryType } from "domain/types/inventory.type"
import { PageResponse } from "model/base/base-metadata.response";
import { AllInventoryResponse, HistoryInventoryQuery, HistoryInventoryResponse, InventoryQuery, InventoryResponse } from "model/inventory";

const inventoryGetListAction = (query: InventoryQuery, onResult: (data: PageResponse<AllInventoryResponse>|false) => void) => {
  return BaseAction(InventoryType.GET, {query, onResult})
}

const inventoryGetDetailAction = (query: InventoryQuery, onResult: (data: PageResponse<InventoryResponse>|false) => void) => {
  return BaseAction(InventoryType.GET_DETAIL, {query, onResult})
}

const inventoryGetHistoryAction = (query: HistoryInventoryQuery, onResult: (data: PageResponse<HistoryInventoryResponse>|false) => void) => {
  return BaseAction(InventoryType.GET_HISTORY, {query, onResult})
}

export {inventoryGetListAction, inventoryGetDetailAction, inventoryGetHistoryAction};