import BaseAction from "base/base.action";
import {InventoryType} from "domain/types/inventory.type";
import {PageResponse} from "model/base/base-metadata.response";
import {
  AllInventoryResponse,
  HistoryInventoryQuery,
  HistoryInventoryResponse,
  InventoryQuery,
  InventoryResponse,
  InventoryVariantListQuery,
} from "model/inventory";

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

export {
  inventoryGetListAction,
  inventoryGetDetailAction,
  inventoryGetHistoryAction,
  inventoryGetDetailVariantIdsSaga,
  inventoryGetDetailVariantIdsExt,
  inventoryByVariantAction
};
