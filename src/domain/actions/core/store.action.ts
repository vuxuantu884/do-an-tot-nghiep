import { StoreResponse as StoreResponse1 } from 'model/response/core/store.response';
import BaseAction from 'base/BaseAction';
import { StoreType } from 'domain/types/core.type';
import { StoreQuery } from 'model/core/query/store.query';
import { PageResponse } from 'model/base/base-metadata.response';
import { StoreCreateRequest, StoreUpdateRequest } from 'model/core/request/store.request';
import { StoreResponse } from 'model/core/response/store.response';

export const StoreGetListAction = (setData: (data: Array<StoreResponse1>) => void) => {
    return BaseAction(StoreType.GET_LIST_STORE_REQUEST, {setData});
}

export const StoreSearchAction = (query: StoreQuery ,setData: (data: PageResponse<StoreResponse>) => void) => {
    return BaseAction(StoreType.STORE_SEARCH, {query, setData});
}

export const StoreCreateAction = (request: StoreCreateRequest ,onCreateSuccess: () => void) => {
    return BaseAction(StoreType.STORE_CREATE, {request, onCreateSuccess});
}

export const StoreUpdateAction = (id: number, request: StoreUpdateRequest ,onUpdateSuccess: () => void) => {
    return BaseAction(StoreType.STORE_UPDATE, {id, request, onUpdateSuccess});
}

export const StoreDetailAction = (id: number, setData: (data: StoreResponse) => void) => {
    return BaseAction(StoreType.STORE_DETAIL, {id, setData});
}

export const StoreDeleteAction = (id: number, onDeleteSuccess: (data: StoreResponse) => void) => {
    return BaseAction(StoreType.STORE_DELETE, {id, onDeleteSuccess});
}

