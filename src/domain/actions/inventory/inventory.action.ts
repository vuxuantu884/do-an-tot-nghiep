import BaseAction from "base/base.action";
import BaseResponse from "base/base.response";
import {InventoryConfigType, InventoryType} from "domain/types/inventory.type";
import {PageResponse} from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  HistoryInventoryQuery,
  HistoryInventoryResponse,
  InventoryQuery,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";
import { FilterConfig, FilterConfigRequest } from "model/other";

const inventoryGetListAction = (
  query: InventoryQuery,
  onResult: (data: PageResponse<AllInventoryResponse> | false) => void
) => {
  return BaseAction(InventoryType.GET, {query, onResult});
};
const inventoryByVariantAction = (
  query: InventoryVariantListQuery,
  onResult: (data: Array<AllInventoryResponse>) => void
) => {
  return BaseAction(InventoryType.GET_BY_VARIANTS, {query, onResult});
};

const inventoryGetDetailAction = (
  query: InventoryQuery,
  onResult: (data: PageResponse<InventoryResponse> | false) => void
) => {
  return BaseAction(InventoryType.GET_DETAIL, {query, onResult});
};

const inventoryGetHistoryAction = (
  query: HistoryInventoryQuery,
  onResult: (data: PageResponse<HistoryInventoryResponse> | false) => void
) => {
  return BaseAction(InventoryType.GET_HISTORY, {query, onResult});
};

const inventoryGetDetailVariantIdsSaga = (
  variant_id: Number[],
  store_id: Number | null,
  setData: (data: Array<InventoryResponse> | null) => void
) => {
  return BaseAction(InventoryType.GET_DETAIL_lIST_VARIANT, {
    variant_id,
    store_id,
    setData,
  });
};

const inventoryGetDetailVariantIdsExt = (
  variant_id: Number[],
  store_id: Number | null,
  setData: (data: Array<InventoryResponse> | null) => void
) => {
  return BaseAction(InventoryType.GET_DETAIL_lIST_VARIANT_EXT, {
    variant_id,
    store_id,
    setData,
  });
};

const getConfigInventoryAction = (
  code: string,
  onResult: (result: BaseResponse<Array<FilterConfig>>) => void
) => {
  return BaseAction(InventoryConfigType.GET_INVENTORY_CONFIG, {
    code,
    onResult
  });
};
const createConfigInventoryAction = (
  request: FilterConfigRequest,
  onResult: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(InventoryConfigType.CREATE_INVENTORY_CONFIG, {
    request,
    onResult
  });
};
const updateConfigInventoryAction = (
  request: FilterConfigRequest,
  onResult: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(InventoryConfigType.UPDATE_INVENTORY_CONFIG, {
    request,
    onResult
  });
};

const deleteConfigInventoryAction = (
  id: number,
  onResult: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(InventoryConfigType.DELETE_INVENTORY_CONFIG, {
    id,
    onResult
  });
};

export {
  inventoryGetListAction,
  inventoryGetDetailAction,
  inventoryGetHistoryAction,
  inventoryGetDetailVariantIdsSaga,
  inventoryGetDetailVariantIdsExt,
  inventoryByVariantAction,
  getConfigInventoryAction,
  createConfigInventoryAction,
  updateConfigInventoryAction,
  deleteConfigInventoryAction
};
