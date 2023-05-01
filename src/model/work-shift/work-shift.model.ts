interface WorkShiftBase {
  id?: number;
  deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  version?: number;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

export interface WorkShiftTableRequest {
  location_id: number;
  location_name: string;
  from_date: string;
  to_date: string;
}

export interface WorkShiftTableResponse extends WorkShiftBase {
  title: string;
  location_id: number;
  location_name: string;
  from_date: string;
  to_date: string;
}

export interface WorkShiftCellQuery {
  select_query?: string | null;
  issued_date?: string[];
  work_hour_name?: string | null;
  assigned_to?: string | null;
}
