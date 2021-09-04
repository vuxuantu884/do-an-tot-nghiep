import { BaseObject } from "model/base/base.response";

export interface OrderActionLogResponse extends BaseObject {
  id: number;
  status: string;
}

export interface ActionLogDetailResponse extends BaseObject {
  id: number;
  data: string;
}
