export interface CustomByDepartment {
  /** Level trực thuộc */
  [key: string]: string | number;
  /** Id */
  id: number;
  /** Tên */
  name: string;
  /** ID tương ứng */
  department_id: number;
  /** Tên tương ứng */
  department: string;
}
