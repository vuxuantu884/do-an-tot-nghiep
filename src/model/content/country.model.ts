import { BaseObject } from "model/base/base.response";

export interface CountryResponse extends BaseObject {
  value?: number;
  name: string
}
