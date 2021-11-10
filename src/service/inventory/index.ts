import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  AllInventoryResponse,
  HistoryInventoryQuery,
  HistoryInventoryResponse,
  InventoryQuery,
  InventoryResponse,
} from "model/inventory";
import { LogisticGateAwayResponse } from "model/inventory/transfer";
import { generateQuery } from "utils/AppUtils";

const inventoryGetApi = (
  query: InventoryQuery
): Promise<BaseResponse<AllInventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories?${params}`;
  return BaseAxios.get(link);
};

const logisticGateAwayGetApi = (): Promise<BaseResponse<LogisticGateAwayResponse>> => {
  let link = `${ApiConfig.LOGISTIC_GATEWAY}/delivery-services/services`;
  return BaseAxios.get(link);
};

const inventoryGetDetailApi = (
  query: InventoryQuery
): Promise<BaseResponse<InventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/inventories/detail?${params}`;
  return BaseAxios.get(link);
};

const inventoryGetHistoryApi = (
  query: HistoryInventoryQuery
): Promise<BaseResponse<HistoryInventoryResponse>> => {
  let params = generateQuery(query);
  let link = `${ApiConfig.INVENTORY}/histories?${params}`;
  return BaseAxios.get(link);
};

const inventoryGetDetailVariantIdsApi = (
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

const inventoryGetDetailVariantIdsExtApi = (
  variant_id: number[],
  store_id: number | null
): Promise<BaseResponse<Array<InventoryResponse>>> => {
  let queryString = "";
  if (store_id) queryString += `store_id=${store_id}&`;
  if (variant_id.length>0)
  {
    variant_id.forEach(function (value,index) {
      queryString += `variant_ids=${value}`
      if(index<variant_id.length-1)
        queryString += `&`
    });
  }
  let link = `${ApiConfig.INVENTORY}/inventories?is_detail=true&${queryString}`;
  return BaseAxios.get(link);
};

export {
  inventoryGetApi,
  inventoryGetDetailApi,
  inventoryGetHistoryApi,
  inventoryGetDetailVariantIdsApi,
  logisticGateAwayGetApi,
  inventoryGetDetailVariantIdsExtApi
};
