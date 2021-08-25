import { BaseObject } from "model/base/base.response";

export interface ExportRequest {
  conditions?: string;
  type: string;
}

export interface ExportResponse extends BaseObject {
  name: string;
  status: string;
  num_of_record: number;
  total: number;
  url: string;
}
