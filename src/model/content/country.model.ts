import { BaseObject } from "model/base/base.response";

export interface CountryResponse extends BaseObject {
  value?: number;
  name: string;
}

export interface RegionResponse extends BaseObject {
  max_nsn: number | null;
  min_nsn: number | null;
  region_code: number | null;
  country_name: string | null;
  note: string | null;
  flag_image: string | null;
}
