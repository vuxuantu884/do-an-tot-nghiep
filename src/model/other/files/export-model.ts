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


export interface ExportProductResponse extends BaseObject{
  api_error: string;
  download_type: string;
  errors_msg: string;
  finish: boolean;
  process_id: number;
  total: number | null;
  total_created: Date;
  total_error: string | null;
  total_success: number | null;
  total_updated: Date;
  url: string;
}

export interface ImportRequest {
  url?: string;
  conditions?: string;
  type: string;
}

export interface ImportResponse extends BaseObject {
  id: number;
  code: string;
  version: number;
  created_by: string;
  created_name: string;
  created_date: Date;
  updated_by: string;
  updated_name: string;
  updated_date: Date;
  name?: string;
  status: string;
  num_of_record: number;
  total: number;
  total_process: number;
  processed: number;
  success: number;
  percent: number;
  error: number;
  url: string;
  message: string[];
}
