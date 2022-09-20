import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import {
  DataExport,
  DataMultipleCancel,
  DeleteTicketRequest,
  FileParam,
  InventoryTransferDetailItem,
  InventoryTransferImportExportSearchQuery,
  InventoryTransferLog,
  InventoryTransferLogSearchQuery,
  InventoryTransferSearchQuery,
  InventoryTransferShipmentRequest,
  StockTransferSubmit,
  Store,
  StoreStatus,
} from "model/inventory/transfer";
import * as queryString from "query-string";
import { VariantResponse } from "../../../model/product/product.model";
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
import { GetFeesRequest } from "model/request/order.request";
import { VTPFeeResponse } from "model/response/order/order.response";

export const getListInventoryTransferApi = (
  query: InventoryTransferSearchQuery,
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers?${queryString}`);
};

export const getListImportExportTransferApi = (
  query: InventoryTransferImportExportSearchQuery,
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(
    `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/variants?${queryString}`,
  );
};

export const updateNoteTransferApi = (id: number, data: any): Promise<BaseResponse<any>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}/note`, data);
};

export const getListLogInventoryTransferApi = (
  query: InventoryTransferLogSearchQuery,
): Promise<BaseResponse<PageResponse<InventoryTransferLog>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/logs?${queryString}`);
};

export const inventorGetDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}`);
};

export const inventorGetCopyDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/clone/${id}`);
};

export const DeleteInventoryService = (
  id: string,
  request: DeleteTicketRequest,
): Promise<BaseResponse<InventoryTransferDetailItem>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/cancel/${id}`, request);
};

export const cancelMultipleTransferTicketApi = (
  request: any,
): Promise<BaseResponse<InventoryTransferDetailItem>> => {
  return BaseAxios.put(
    `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/multiple-cancel`,
    request,
  );
};

export const getInfoDeliveryFees = (
  request: GetFeesRequest,
): Promise<BaseResponse<VTPFeeResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOGISTIC_GATEWAY}/shipping-orders/fees`, request);
};

export const inventoryTransferGetDetailVariantIdsApi = (
  variant_id: number[],
  store_id: number | null,
): Promise<BaseResponse<Array<InventoryResponse>>> => {
  let queryString = "";
  if (store_id) queryString += `store_id=${store_id}`;
  if (variant_id) variant_id.forEach((element) => (queryString += `&variant_id=${element}`));
  let link = `${ApiConfig.INVENTORY}/inventories/detail?page=1&limit=10000&is_pageable=false&${queryString}`;
  return BaseAxios.get(link);
};

const TransferService = {
  ///get
  getStoreApi: (storeStatus: StoreStatus): Promise<BaseResponse<Store>> => {
    const url = `${ApiConfig.CORE}/stores?${queryString.stringify(storeStatus)}`;
    return BaseAxios.get(url);
  },
  getTransferRecordNumberApi: (): Promise<BaseResponse<Store>> => {
    const url = `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/in-out`;
    return BaseAxios.get(url);
  },
  getVariantByStoreApi: (
    storeStatus: StoreStatus,
  ): Promise<BaseResponse<Partial<VariantResponse[]>>> => {
    const url = `${ApiConfig.PRODUCT}/variants?${queryString.stringify(storeStatus)}`;
    return BaseAxios.get(url);
  },
  uploadFileApi: ({
    files,
    folder = "stock-transfer",
  }: FileParam): Promise<BaseResponse<string[]>> => {
    let url = `${ApiConfig.CORE}/upload/file`;
    const formData = new FormData();
    formData.append("folder", folder);

    files?.forEach((file) => {
      formData.append("files", file);
    });
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return BaseAxios.post(url, formData, config);
  },

  //post
  createInventoryTransfer: (data: StockTransferSubmit): Promise<BaseResponse<string>> => {
    return BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers`, data);
  },

  createInventoryTransferRequest: (data: StockTransferSubmit): Promise<BaseResponse<string>> => {
    return BaseAxios.post(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/transfer-request`,
      data,
    );
  },

  checkDuplicateInventoryTransferRequest: (data: StockTransferSubmit): Promise<BaseResponse<string>> => {
    return BaseAxios.post(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/check-duplicate`,
      data,
    );
  },

  createInventoryTransferShipment: (
    id: number,
    data: InventoryTransferShipmentRequest,
  ): Promise<BaseResponse<any>> => {
    return BaseAxios.post(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}/shipment`,
      data,
    );
  },

  adjustmentInventory: (id: number): Promise<BaseResponse<any>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}/balance`);
  },

  //update
  updateInventoryTransfer: (
    id: number,
    data: StockTransferSubmit,
  ): Promise<BaseResponse<string>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}`, data);
  },

  receivedInventoryTransfer: (
    id: number,
    data: StockTransferSubmit,
  ): Promise<BaseResponse<string>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/receive/${id}`, data);
  },

  //cancel shipment
  cancelShipmentInventoryTransfer: (transferId: number): Promise<BaseResponse<string>> => {
    return BaseAxios.delete(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${transferId}/shipment`,
    );
  },

  //export shipment
  exportShipmentInventoryTransfer: (transferId: number, data: any): Promise<BaseResponse<string>> => {
    return data.secret ? BaseAxios.put(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${transferId}/export`,
      data,
    ) : BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${transferId}/export`);
  },

  acceptInventoryTransfer: (transferId: number): Promise<BaseResponse<string>> => {
    return BaseAxios.put(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${transferId}/accept-request`,
    );
  },

  exportMultipleInventoryTransfer: (data: DataExport): Promise<BaseResponse<string>> => {
    return BaseAxios.put(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/multiple-export`,
      data,
    );
  },

  cancelMultipleInventoryTransfer: (data: DataMultipleCancel): Promise<BaseResponse<string>> => {
    return BaseAxios.put(
      `${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/multiple-cancel`,
      data,
    );
  },
};

export const {
  getStoreApi,
  getVariantByStoreApi,
  uploadFileApi,
  createInventoryTransfer,
  createInventoryTransferRequest,
  checkDuplicateInventoryTransferRequest,
  updateInventoryTransfer,
  createInventoryTransferShipment,
  receivedInventoryTransfer,
  cancelShipmentInventoryTransfer,
  exportShipmentInventoryTransfer,
  acceptInventoryTransfer,
  exportMultipleInventoryTransfer,
  cancelMultipleInventoryTransfer,
  adjustmentInventory,
  getTransferRecordNumberApi,
} = TransferService;
