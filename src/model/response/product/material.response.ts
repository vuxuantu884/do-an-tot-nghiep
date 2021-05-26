import { BaseObject } from "../base.response";

export interface MaterialResponse extends BaseObject {
  name: string,
  component: string,
  description: string,
}