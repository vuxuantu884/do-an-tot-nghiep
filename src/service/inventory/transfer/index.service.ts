import BaseResponse from "../../../base/base.response";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import {
  DeleteTicketRequest,
  FileParam,
  InventoryTransferDetailItem,
  InventoryTransferSearchQuery,
  StockTransferSubmit,
  Store,
  StoreStatus,
} from "../../../model/inventory/transfer";
import * as queryString from "querystring";
import { VariantResponse } from "../../../model/product/product.model";
import { generateQuery } from "utils/AppUtils";

export const getListInventoryTransferApi = (
  query: InventoryTransferSearchQuery
): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.INVENTORY}/inventory-transfers?${queryString}`);
};

export const inventorGetDetailApi = (id: number) => {
  return BaseAxios.get(`${ApiConfig.INVENTORY}/inventory-transfers/${id}`);
}

export const DeleteInventoryService = (
  id: string,
  request: DeleteTicketRequest
): Promise<BaseResponse<InventoryTransferDetailItem>> => {
  return BaseAxios.put(`${ApiConfig.INVENTORY}/inventory-transfers/delete/${id}`, request);
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
    return BaseAxios.post(`${ApiConfig.INVENTORY}/inventory-transfers`, data);
  },

  //update
  updateInventoryTransfer: (
    id: number, data: StockTransferSubmit
  ): Promise<BaseResponse<string>> => {
    return BaseAxios.put(`${ApiConfig.INVENTORY}/inventory-transfers/${id}`, data);
  },
};

export const { getStoreApi, getVariantByStoreApi, uploadFileApi, createInventoryTransfer, updateInventoryTransfer } =
  TransferService;
