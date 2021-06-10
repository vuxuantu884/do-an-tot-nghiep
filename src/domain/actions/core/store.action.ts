import { StoreResponse } from 'model/response/core/store.response';
import BaseAction from 'base/BaseAction';
import { StoreType } from 'domain/types/product.type';

export const getListStoreRequest = (setData: (data: Array<StoreResponse>) => void) => {
    return BaseAction(StoreType.GET_LIST_STORE_REQUEST, {setData});
}

export const validateStoreAction = (id: number, setData: (data: StoreResponse) => void) => {
    return BaseAction(StoreType.VALIDATE_STORE, { id: id,  setData: setData});
}
