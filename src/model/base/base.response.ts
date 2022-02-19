export interface BaseObject {
  id: number;
  code: string;
  created_name?: string;
  created_by?: string;
  created_date?: Date;
  updated_by?: string;
  updated_name?: string;
  updated_date?: Date;
  version?: number;
  request_id?: string | null;
  operator_kc_id?: string | null;
}