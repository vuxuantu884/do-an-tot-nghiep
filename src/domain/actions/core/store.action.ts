import { StoreModel } from 'model/other/Core/store-model';
import BaseAction from 'base/BaseAction';
import { StoreType } from 'domain/types/product.type';
import { AccountModel } from 'model/other/Account/AccountModel';

export const getListStoreAction = (setData: (data: Array<StoreModel>) => void) => {
    return BaseAction(StoreType.GET_LIST_STORE_REQUEST, {setData});
}

export const getListStoreSuccess = (data: Array<StoreModel>) => {
    return BaseAction(StoreType.GET_LIST_STORE_RESPONSE, { data });
}

export const getListStoreError = () => {
    return BaseAction(StoreType.GET_LIST_STORE_ERROR, null);
}

export const validateStoreAction = (id: number, setData: (data: StoreModel) => void) => {
    return BaseAction(StoreType.VALIDATE_STORE, { id: id,  setData: setData});
}


export const saveAccounts = (accounts: Array<AccountModel>) => {
    return BaseAction(StoreType.SAVE_ACCOUNT_STORE, { accounts: accounts });
}


// export { getListStoreRequest, getListStoreSuccess, validateStoreAction, saveAccounts, getListStoreError };