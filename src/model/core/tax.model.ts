import { BaseObject } from "model/base/base.response";

export interface TaxConfigResponse {
  tax_included: boolean;
  data: Array<TaxConfigCountry>;
}

export interface TaxConfigCountry extends BaseObject {
  country_code: string;
  country_name: string;
  tax_rate: number;
  country_image_url?: string;
}
