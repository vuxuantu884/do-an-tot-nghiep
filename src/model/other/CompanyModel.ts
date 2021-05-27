import { BaseModel } from "./BaseModel";

export interface CompanyModel extends BaseModel {
  name: string;
  currency_code: string;
  country_id: number;
  country: string;
}