import { StoreModel } from 'model/other/StoreModel';
import BaseAction from 'base/BaseAction';
import AppSettingType from 'domain/types/appsetting.type';
import { CompanyModel } from 'model/other/CompanyModel';

const splitLineChange = (value: boolean) => {
  return BaseAction(AppSettingType.SPLIT_LINE_CHANGE, {value})
}

const storeChange = (value: StoreModel) => {
  return BaseAction(AppSettingType.STORE_CHANGE, {value: value});
}

const companyChange = (value: CompanyModel) => {
  return BaseAction(AppSettingType.COMPANY_UPDATE, {value: value});
}

export {splitLineChange, storeChange, companyChange};