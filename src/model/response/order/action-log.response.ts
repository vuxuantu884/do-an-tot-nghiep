import { BaseObject } from "model/base/base.response";

export interface OrderActionLogResponse extends BaseObject {
  id: number;
  status?: string;
  action?: string;
  store?: string;
  code: string;
  data?: string;
  root_id?: number;
}

export interface ActionLogDetailSingleType {
  action?: string;
  code?: string;
  data?: string;
  id?: number;
  root_id?: number;
  status?: string;
}
export interface ActionLogDetailResponse extends BaseObject {
  before: ActionLogDetailSingleType;
  current: ActionLogDetailSingleType;
}
