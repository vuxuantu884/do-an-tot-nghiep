import { BaseModel } from '../base-model';

export interface CompanyModel extends BaseModel {
  name: string;
  currency_code: string;
  country_id: number;
  country: string;
}