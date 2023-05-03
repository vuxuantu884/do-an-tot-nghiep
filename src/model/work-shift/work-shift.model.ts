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
  location_id?: number | null;
  issued_date?: string[];
  work_hour_name?: string | null;
  assigned_to?: string | null;
}

export interface WorkShiftAssignmentModel extends WorkShiftBase {
  work_shift_cell_id?: number;
  assigned_to?: string;
  assigned_name?: string;
  role?: string;
}

export interface WorkShiftCellResponse extends WorkShiftBase {
  location_id?: number;
  location_name?: string;
  issued_date?: string;
  work_hour_name?: string;
  from_minutes?: number;
  to_minutes?: number;
  target_revenue?: number;
  quota_by_hours?: number;
  traffic?: number;
  work_shift_assignment_dtos: WorkShiftAssignmentModel[];
}
