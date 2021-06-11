import { BaseObject } from "model/base/base.response";

export interface MaterialResponse extends BaseObject {
  name: string,
  component: string,
  description: string,
}