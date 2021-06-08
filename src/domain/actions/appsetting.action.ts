import { StoreModel } from 'model/other/Core/store-model';
import BaseAction from 'base/BaseAction';
import AppSettingType from 'domain/types/appsetting.type';

const splitLineChange = (value: boolean) => {
  return BaseAction(AppSettingType.SPLIT_LINE_CHANGE, {value})
}

const storeChange = (value: StoreModel) => {
  return BaseAction(AppSettingType.STORE_CHANGE, {value: value});
}

export {splitLineChange, storeChange};