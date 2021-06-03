import { StoreModel } from 'model/other/StoreModel';
import BaseAction from 'base/BaseAction';
import { StoreType } from 'domain/types/product.type';
import { AccountModel } from 'model/other/Account/AccountModel';

const getListStoreRequest = (setData: (data: Array<StoreModel>) => void) => {
    return BaseAction(StoreType.GET_LIST_STORE_REQUEST, {setData});
}

const getListStoreSuccess = (data: Array<StoreModel>) => {
    return BaseAction(StoreType.GET_LIST_STORE_RESPONSE, { data });
}

const getListStoreError = () => {
    return BaseAction(StoreType.GET_LIST_STORE_ERROR, null);
}

const validateStoreAction = (id: number, setData: (data: StoreModel) => void) => {
    return BaseAction(StoreType.VALIDATE_STORE, { id: id,  setData: setData});
}


const saveAccounts = (accounts: Array<AccountModel>) => {
    return BaseAction(StoreType.SAVE_ACCOUNT_STORE, { accounts: accounts });
}


export { getListStoreRequest, getListStoreSuccess, validateStoreAction, saveAccounts, getListStoreError };