import BaseAction from "base/base.action";
import BaseResponse from "base/base.response";
import {InventoryType} from "domain/types/inventory.type";
import {PageResponse} from "model/base/base-metadata.response";
import {StoreResponse} from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import {
  InventoryAdjustmentDetailItem,
  InventoryAdjustmentSearchQuery,
  LineItemAdjustment,
  StoreStatus,
} from "model/inventoryadjustment";
import { VariantResponse } from "model/product/product.model";
import {PrinterInventoryTransferResponseModel} from "model/response/printer.response";

const inventoryGetSenderStoreAction = (
  queryParams: StoreStatus,
  onResult: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(InventoryType.GET_STORE, {queryParams, onResult});
};

const getListInventoryAdjustmentAction = (
  queryParams: InventoryAdjustmentSearchQuery,
  onResult: (data: PageResponse<Array<InventoryAdjustmentDetailItem>> | false) => void
) => {
  return BaseAction(InventoryType.GET_LIST_INVENTORY_ADJUSTMENT, {queryParams, onResult});
};

const getDetailInventoryAdjustmentAction = (
  id: number,
  onResult: (result: BaseResponse<InventoryAdjustmentDetailItem> | false) => void
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
  lineId: number,
  data: Partial<LineItemAdjustment>,
  onResult: (data: LineItemAdjustment) => void
) => {
  return BaseAction(InventoryType.UPDATE_ITEM_ONLINE_INVENTORY, {
    id,
    lineId,
    data,
    onResult,
  });
};

const updateReasonItemOnlineInventoryAction = (
  id: number,
  lineId: number,
  data: Partial<LineItemAdjustment>,
  onResult: (data: LineItemAdjustment) => void
) => {
  return BaseAction(InventoryType.UPDATE_REASON_ITEM_ONLINE_INVENTORY, {
    id,
    lineId,
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

const getLinesItemAdjustmentAction = (
  id: number,
  queryString: string | null,
  onResult: (data: PageResponse<LineItemAdjustment> | false) => void
) => {
  return BaseAction(InventoryType.GET_LINES_ITEM_ADJUSTMENT, {
    id,
    queryString,
    onResult,
  });
};

const updateInventoryAdjustmentAction = (
  id: number,
  data: Partial<InventoryAdjustmentDetailItem>,
  onResult: (data: InventoryAdjustmentDetailItem) => void
) => {
  return BaseAction(InventoryType.UPDATE_ADJUSTMENT, {
    id,
    data,
    onResult,
  });
};

const getVariantHasOnHandByStoreAction = (
  query: InventoryQuery,
  onResult: (result: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(InventoryType.GET_VARIANT_HAS_ON_HAND_BY_STORE, {
    query,
    onResult
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
  InventoryAdjustmentGetPrintContentAction,
  getLinesItemAdjustmentAction,
  updateInventoryAdjustmentAction,
  getVariantHasOnHandByStoreAction,
  updateReasonItemOnlineInventoryAction
};
