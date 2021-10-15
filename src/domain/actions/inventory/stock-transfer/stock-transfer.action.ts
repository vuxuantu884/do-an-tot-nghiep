import BaseAction from "../../../../base/base.action";
import { InventoryType } from "../../../types/inventory.type";
import {
  DeleteTicketRequest,
  FileParam,
  InventoryTransferDetailItem,
  InventoryTransferSearchQuery,
  StockTransferSubmit,
  Store,
  StoreStatus,
} from "../../../../model/inventory/transfer";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { VariantResponse } from "../../../../model/product/product.model";

const inventoryGetSenderStoreAction = (
  queryParams: StoreStatus,
  onResult: (data: Array<Store>) => void
) => {
  return BaseAction(InventoryType.GET_STORE, { queryParams, onResult });
};
const inventoryGetVariantByStoreAction = (
  queryParams: StoreStatus,
  onResult: (data: PageResponse<VariantResponse>) => void
) => {
  return BaseAction(InventoryType.GET_VARIANT_BY_STORE, {
    queryParams,
    onResult,
  });
};
const inventoryUploadFileAction = (
  queryParams: Partial<FileParam>,
  onResult: (data: string[]) => void
) => {
  return BaseAction(InventoryType.UPLOAD_FILES, { queryParams, onResult });
};

const creatInventoryTransferAction = (
  data: Partial<StockTransferSubmit>,
  onResult: (data: InventoryTransferDetailItem) => void
) => {
  return BaseAction(InventoryType.CREATE_INVENTORY_TRANSFER, {
    data,
    onResult,
  });
};

const updateInventoryTransferAction = (
  id: number,
  data: Partial<StockTransferSubmit>,
  onResult: (data: InventoryTransferDetailItem) => void
) => {
  return BaseAction(InventoryType.UPDATE_INVENTORY_TRANSFER, {
    id,
    data,
    onResult,
  });
};

const getListInventoryTransferAction = (
  queryParams: InventoryTransferSearchQuery,
  onResult: (data: PageResponse<Array<InventoryTransferDetailItem>>) => void
) => {
  return BaseAction(InventoryType.GET_LIST_INVENTORY_TRANSFER, {
    queryParams,
    onResult,
  });
};

const getDetailInventoryTransferAction = (
  id: number,
  onResult: (result: InventoryTransferDetailItem | false) => void
) => {
  return BaseAction(InventoryType.GET_DETAIL_INVENTORY_TRANSFER, {
    id,
    onResult,
  });
};

const deleteInventoryTransferAction = (
  id: number,
  request: DeleteTicketRequest,
  setData: (data: InventoryTransferDetailItem) => void
) => {
  return BaseAction(InventoryType.DELETE_INVENTORY_TRANSFER, {
    id,
    request,
    setData,
  });
};

export {
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
  creatInventoryTransferAction,
  updateInventoryTransferAction,
  getListInventoryTransferAction,
  getDetailInventoryTransferAction,
  deleteInventoryTransferAction,
};
