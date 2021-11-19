import { StoreResponse, StoreTypeRequest, StoreValidateRequest } from "model/core/store.model";
import BaseAction from "base/base.action";
import { StoreType } from "domain/types/core.type";
import { StoreQuery } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreCreateRequest, StoreUpdateRequest } from "model/core/store.model";
import { StoreRankResponse } from "model/core/store-rank.model";
import { StoreCustomResponse } from "model/response/order/order.response";

export const StoreGetListAction = (
  setData: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(StoreType.GET_LIST_STORE_REQUEST, { setData });
};

export const StoreSearchAction = (
  query: StoreQuery,
  setData: (data: PageResponse<StoreResponse>) => void
) => {
  return BaseAction(StoreType.STORE_SEARCH, { query, setData });
};

export const StoreCreateAction = (
  request: StoreCreateRequest,
  onCreateSuccess: (data: StoreResponse|false) => void
) => {
  return BaseAction(StoreType.STORE_CREATE, { request, onCreateSuccess });
};

export const StoreUpdateAction = (
  id: number,
  request: StoreUpdateRequest,
  onUpdateSuccess: () => void
) => {
  return BaseAction(StoreType.STORE_UPDATE, { id, request, onUpdateSuccess });
};

export const StoreDetailAction = (
  id: number,
  setData: (data: StoreResponse) => void
) => {
  return BaseAction(StoreType.STORE_DETAIL, { id, setData });
};

export const StoreDetailCustomAction = (
  id: number,
  setData: (data: StoreCustomResponse) => void
) => {
  return BaseAction(StoreType.STORE_DETAIL_CUSTOM, { id, setData });
};

export const StoreDeleteAction = (
  id: number,
  onDeleteSuccess: (data: StoreResponse) => void
) => {
  return BaseAction(StoreType.STORE_DELETE, { id, onDeleteSuccess });
};

export const StoreRankAction = (
  setData: (data: Array<StoreRankResponse>) => void
) => {
  return BaseAction(StoreType.STORE_RANK, { setData });
};

export const getListStoresSimpleAction = (
  setData: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(StoreType.GET_LIST_STORE_REQUEST_SIMPLE, { setData });
};

export const StoreSearchListAction = (
  name:string,
  setData: (data: Array<StoreResponse>) => void
) => {
  return BaseAction(StoreType.GET_SEARCH_STORE_REQUEST, { name,setData });
};

export const StoreValidateAction = (
  data: StoreValidateRequest,
  setData: (data: true|Array<string>) => void
) => {
  return BaseAction(StoreType.STORE_VALIDATE, { data, setData });
};

export const StoreGetTypeAction = (
  onSuccess: (data: Array<StoreTypeRequest>) => void
) => {
  return BaseAction(StoreType.STORE_TYPE, { onSuccess });
};

export const getStoreSearchIdsAction=(storeids:number[],setData:(data:PageResponse<StoreResponse>)=>void)=>{
  return BaseAction(StoreType.STORE_SEARCH_IDS, { storeids,setData });
}