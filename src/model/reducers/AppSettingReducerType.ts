import { CompanyModel } from 'model/other/Core/company-model';

export interface StoreSetting {
  id: number;
  name: string;
  code?: string;
}

export interface DataSetiingType {
  splitLine: boolean
  store: StoreSetting
  company: CompanyModel
}

export interface AppSettingReducerType {
  isLoad: boolean,
  data: DataSetiingType
}