import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import {
  DeleteTicketRequest,
  FileParam,
  InventoryTransferDetailItem,
  InventoryTransferLog,
  InventoryTransferLogSearchQuery,
  InventoryTransferSearchQuery,
  InventoryTransferShipmentRequest,
  StockTransferSubmit,
  Store,
  StoreStatus,
} from "model/inventory/transfer";
import * as queryString from "querystring";
import { VariantResponse } from "../../../model/product/product.model";
import { generateQuery } from "utils/AppUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";

export const getListInventoryTransferApi = (
  query: InventoryTransferSearchQuery
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers?${queryString}`);
};

export const getListLogInventoryTransferApi = (
  query: InventoryTransferLogSearchQuery
): Promise<BaseResponse<PageResponse<InventoryTransferLog>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/logs?${queryString}`);
};

export const inventorGetDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}`);
}

export const DeleteInventoryService = (
  id: string,
  request: DeleteTicketRequest
): Promise<BaseResponse<InventoryTransferDetailItem>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/cancel/${id}`, request);
};


export const inventoryTransferGetDetailVariantIdsApi = (
  variant_id: number[],
  store_id: number | null
): Promise<BaseResponse<Array<InventoryResponse>>> => {
  let queryString = "";
  if (store_id) queryString += `store_id=${store_id}`;
  if (variant_id)
    variant_id.forEach((element) => (queryString += `&variant_id=${element}`));
  let link = `${ApiConfig.INVENTORY}/inventories/detail?is_pageable=false&${queryString}`;
  return BaseAxios.get(link);
};


const TransferService = {
  ///get
  getStoreApi: (storeStatus: StoreStatus): Promise<BaseResponse<Store>> => {
    const url = `${ApiConfig.CORE}/stores?${queryString.stringify(
      storeStatus
    )}`;
    return BaseAxios.get(url);
  },
  getVariantByStoreApi: (
    storeStatus: StoreStatus
  ): Promise<BaseResponse<Partial<VariantResponse[]>>> => {
    const url = `${ApiConfig.PRODUCT}/variants?${queryString.stringify(
      storeStatus
    )}`;
    return BaseAxios.get(url);
  },
  uploadFileApi: ({
    files,
    folder = "stock-transfer",
  }: FileParam): Promise<BaseResponse<string[]>> => {
    // console.log('files',files)
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
  createInventoryTransfer: (
    data: StockTransferSubmit
  ): Promise<BaseResponse<string>> => {
    return BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers`, data);
  },

  createInventoryTransferShipment: (
    id: number,
    data: InventoryTransferShipmentRequest
  ): Promise<BaseResponse<any>> => {
    return BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}/shipment`, data);
  },

  //update
  updateInventoryTransfer: (
    id: number, data: StockTransferSubmit
  ): Promise<BaseResponse<string>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${id}`, data);
  },
};

export const { getStoreApi, getVariantByStoreApi, uploadFileApi, createInventoryTransfer, updateInventoryTransfer, createInventoryTransferShipment} =
  TransferService;
