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
  location_id?: number; //mã cửa hàng
  location_name?: string; //tên cửa hàng
  issued_date?: string; //ngày làm việc
  work_hour_name?: string; //ca làm việc
  from_minutes?: number; //thời gian bắt đầu của ca
  to_minutes?: number; //thời gian kết thúc của ca
  target_revenue?: number; //mục tiêu doanh thu trong ca
  quota_by_hours?: number; //hạn mức thời gian trong ca
  traffic?: number; //hạn mức nhân viên trong ca
  work_shift_assignment_dtos: WorkShiftAssignmentModel[];
}
