import { BaseObject } from "model/base/base.response";

export interface DistrictResponse extends BaseObject {
  value?: number;
  name: string;
  city_id: number;
  city_name: string;
}

export interface CityView {
  city_name: string;
  city_id: number;
  districts: Array<DistrictView>;
}

export interface DistrictView {
  id: number;
  name: string;
  code: string;
}

export interface ProvinceModel {
  code: string;
  name: string;
  country_id: number;
  id: number;
}
