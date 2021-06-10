import { BaseObject } from "model/response/base.response";

export interface MaterialResponse extends BaseObject {
  name: string,
  component: string,
  description: string,
}