import { BaseObject } from "model/base/base.response";

export interface PurchaseOrderActionLogResponse extends BaseObject {
  id: number;
  status_before?: string;
  status_after?: string;
  action?: string;
  store?: string;
  code: string;
  data?: string;
  root_id?: number;
  procurement_code: string;
}

export interface ActionLogDetailSingleType {
  action?: string;
  code?: string;
  data?: string;
  id?: number;
  root_id?: number;
  status?: string;
  device?: string;
  ip_address?: string;
}

export interface ActionLogDetailResponse extends BaseObject {
  before: ActionLogDetailSingleType;
  current: ActionLogDetailSingleType;
}
