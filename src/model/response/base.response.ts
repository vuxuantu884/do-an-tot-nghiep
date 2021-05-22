export interface BaseObject {
  id: number;
  code: string;
  created_name?: string;
  created_by?: string;
  created_date?: number;
  updated_by?: string;
  updated_name?: string;
  updated_date?: number;
  version?: number;
}