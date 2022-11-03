export interface BaseModel {
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

export interface BaseMetadata {
  page: number;
  total: number;
  limit: number;
}