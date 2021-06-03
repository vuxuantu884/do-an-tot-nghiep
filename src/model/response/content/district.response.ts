import { BaseObject } from "../base.response";

export interface DistrictResponse extends BaseObject {
  name: string,
  city_id: number,
  city_name: string,
}