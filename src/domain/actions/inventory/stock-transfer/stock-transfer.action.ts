import BaseAction from "base/base.action";
import { InventoryType } from "../../../types/inventory.type";
import {
  DataExport,
  DeleteTicketRequest,
  FileParam,
  InventoryTransferDetailItem,
  InventoryTransferLog,
  InventoryTransferLogSearchQuery,
  InventoryTransferSearchQuery,
  StockTransferSubmit,
  Store,
  StoreStatus,
} from "model/inventory/transfer";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { InventoryResponse } from "model/inventory";
import { GetFeesRequest } from "model/request/order.request";

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

const cancelShipmentInventoryTransferAction = (
  transferId: number,
  onResult: (data: InventoryTransferDetailItem) => void
) => {
  return BaseAction(InventoryType.CANCEL_SHIPMENT_INVENTORY, {
    transferId,
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

const receivedInventoryTransferAction = (
  id: number,
  data: Partial<StockTransferSubmit>,
  onResult: (data: InventoryTransferDetailItem) => void
) => {
  return BaseAction(InventoryType.RECEIVED_INVENTORY__TRANSFER, {
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

const getListLogInventoryTransferAction = (
  queryParams: InventoryTransferLogSearchQuery,
  onResult: (data: PageResponse<Array<InventoryTransferLog>>) => void
) => {
  return BaseAction(InventoryType.GET_LIST_LOG_INVENTORY_TRANSFER, {
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

const getCopyDetailInventoryTransferAction = (
  id: number,
  onResult: (result: InventoryTransferDetailItem | false) => void
) => {
  return BaseAction(InventoryType.GET_COPY_DETAIL_INVENTORY_TRANSFER, {
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

const inventoryGetDetailVariantIdsAction = (variant_id:Number[],store_id:Number|null, setData: (data: Array<InventoryResponse>|null) => void) => {
  return BaseAction(InventoryType.GET_DETAIL_lIST_VARIANT_TRANSFER, {variant_id,store_id, setData})
}

const createInventoryTransferShipmentAction = (pathVariantId:Number, body: any, onResult: (data: InventoryTransferDetailItem |null) => void) => {
  return BaseAction(InventoryType.CREATE_INVENTORY_TRANSFER_SHIPMENT, {pathVariantId, body, onResult})
}

const getLogisticGateAwayAction = (onResult: (data: InventoryTransferDetailItem) => void) => {
  return BaseAction(InventoryType.GET_LOGISTIC_SERVICE, {onResult})
}

const getFeesAction = (
  request: GetFeesRequest,
  setData: (data: Array<any>) => void
) => {
  return BaseAction(InventoryType.GET_INFO_FEES_INVENTORY, { request, setData });
}
const adjustmentInventoryAction = (id:Number, onResult: (data: InventoryTransferDetailItem |null) => void) => {
  return BaseAction(InventoryType.ADJUSTMENT_INVENTORY, {id, onResult})
}

const exportInventoryAction = (transferId: number, onResult: (data: InventoryTransferDetailItem) => void) => {
  return BaseAction(InventoryType.EXPORT_INVENTORY, {transferId, onResult})
}

const actionExportInventoryByIds = (data: DataExport, onResult: (data: any) => void) => {
  return BaseAction(InventoryType.EXPORT_MULTIPLE_INVENTORY, {data, onResult})
}

export {
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
  creatInventoryTransferAction,
  updateInventoryTransferAction,
  getListInventoryTransferAction,
  getDetailInventoryTransferAction,
  deleteInventoryTransferAction,
  getListLogInventoryTransferAction,
  inventoryGetDetailVariantIdsAction,
  createInventoryTransferShipmentAction,
  receivedInventoryTransferAction,
  getLogisticGateAwayAction,
  getFeesAction,
  adjustmentInventoryAction,
  getCopyDetailInventoryTransferAction,
  cancelShipmentInventoryTransferAction,
  exportInventoryAction,
  actionExportInventoryByIds,
};
