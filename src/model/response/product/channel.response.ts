import { BaseObject } from "model/base/base.response";

export interface ChannelResponse extends BaseObject {
  code: string;
  id: number;
  name: string;
}
