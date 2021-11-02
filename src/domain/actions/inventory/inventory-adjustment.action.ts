import BaseAction from "base/base.action"
import { InventoryType } from "domain/types/inventory.type"
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { InventoryAdjustmentDetailItem, InventoryAdjustmentSearchQuery, LineItemAdjustment, StoreStatus } from "model/inventoryadjustment";
import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";

const inventoryGetSenderStoreAction = (
  queryParams: StoreStatus,
  onResult: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(InventoryType.GET_STORE, { queryParams, onResult });
};

const getListInventoryAdjustmentAction = (queryParams: InventoryAdjustmentSearchQuery, onResult: (data: PageResponse<Array<InventoryAdjustmentDetailItem>> | false) => void) => {
  return BaseAction(InventoryType.GET_LIST_INVENTORY_ADJUSTMENT, { queryParams, onResult })
}

const getDetailInventoryAdjustmentAction = (
  id: number,
  onResult: (result: InventoryAdjustmentDetailItem | false) => void
) => {
  return BaseAction(InventoryType.GET_DETAIL_INVENTORY_ADJUSTMENT, {
    id,
    onResult,
  });
};

const createInventoryAdjustmentAction = (
  data: Partial<InventoryAdjustmentDetailItem>,
  onResult: (data: InventoryAdjustmentDetailItem) => void
) => {
  return BaseAction(InventoryType.CREATE_INVENTORY_ADJUSTMENT, {
    data,
    onResult,
  });
};

const updateItemOnlineInventoryAction = (
  id: number,
  data: Partial<LineItemAdjustment>,
  onResult: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(InventoryType.UPDATE_ITEM_ONLINE_INVENTORY, {
    id,
    data,
    onResult,
  });
};

const updateOnlineInventoryAction = (
  id: number, 
  onResult: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(InventoryType.UPDATE_ONLINE_INVENTORY, {
    id, 
    onResult,
  });
};

const adjustInventoryAction = (
  id: number, 
  onResult: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(InventoryType.UPDATE_ADJUSTMENT_INVENTORY, {
    id, 
    onResult,
  });
};
const InventoryAdjustmentGetPrintContentAction = (
  queryPrint: string,
  onResult: (result: Array<PrinterInventoryTransferResponseModel>) => void
) => {
  return BaseAction(InventoryType.PRINT_ADJUSTMENT_INVENTORY, {
    queryPrint,
    onResult,
  });
};
export {
  getListInventoryAdjustmentAction,
  createInventoryAdjustmentAction,
  inventoryGetSenderStoreAction,
  getDetailInventoryAdjustmentAction,
  updateItemOnlineInventoryAction,
  updateOnlineInventoryAction,
  adjustInventoryAction,
  InventoryAdjustmentGetPrintContentAction
};
