import { StoreModel } from 'model/other/Core/store-model';
import BaseAction from 'base/BaseAction';
import StoreType from 'domain/types/StoreType';
import { AccountModel } from 'model/other/Account/AccountModel';

const getListStoreRequest = () => {
  return BaseAction(StoreType.GET_LIST_STORE_REQUEST, null);
}

const getListStoreSuccess = (data: Array<StoreModel>) => {
  return BaseAction(StoreType.GET_LIST_STORE_RESPONSE, {data});
}

const getListStoreError = () => {
  return BaseAction(StoreType.GET_LIST_STORE_ERROR, null);
}

const validateStoreAction = (id: number, verify: (isVerify: boolean) => void) => {
  return BaseAction(StoreType.VALIDATE_STORE, {id, verify});
}


const saveAccounts = (accounts: Array<AccountModel>) => {
  return BaseAction(StoreType.SAVE_ACCOUNT_STORE, {accounts: accounts});
}


export {getListStoreRequest, getListStoreSuccess, validateStoreAction, saveAccounts, getListStoreError};