export interface KeyDriverImportFileParams {
  headRow: number;
  type: ImportFileType;
}

export interface ColumnInfo {
  rowKey: string; // total_sale: Doanh thu
  asmName: string; // ASM Tung
  data: any; // data of row
  columnKey: string; // day, actualDay
  columnValue: string | number; // 10000
}

export interface CellInfo {
  rowKey: string; // total_sale: Doanh thu
  columnKey: string; // day, actualDay
  data: any; // data of row
  index: number;
}

export interface KeyDriverItem {
  key_driver: string;
  description?: string;
  value: string | number;
}

export interface UpdateKeyDriverParams {
  department: string;
  year: number;
  month: number;
  key_drivers: KeyDriverItem[];
}

export interface KeyDriverTarget {
  department: string;
  key_drivers: KeyDriverItem[];
}

export interface KeyDriverParams {
  ['year.equals']: number;
  ['month.equals']: number;
}

export interface KDOfflineTotalSalesParams {
  from: string;
  to: string;
  posLocationNames: string[];
  departmentLv2s: string[];
}

export enum ImportFileType {
  SMS = "sms",
  CALL = "call",
}

export enum KeyDriverField {
  TotalSales = 'total_sales',
  OfflineTotalSales = 'offline_total_sales',
  AverageCustomerSpent = 'average_customer_spent',
  AverageOrderValue = 'average_order_value',
  Visitors = 'visitors',
  ConvertionRate = 'convertion_rate',
  CustomersCount = 'customers_count',
  VipTotalSales = 'vip_total_sales',
  NearVipTotalSales = 'near_vip_total_sales',
  BirthdayTotalSales = 'birthday_total_sales',
  CustomerGt90DaysTotalSales = 'customer_gt90_days_total_sales',
  ShopperGt90DaysTotalSales = 'shopper_gt90_days_total_sales',
  NewCustomerTotalSales= 'new_customer_total_sales',
  OthersTotalSales = 'others_total_sales',
  FacebookTotalSales = 'facebook_total_sales',
  ZaloSotalSales = 'zalo_total_sales',
  UniformTotalSales = 'uniform_total_sales',
  UniformOnlineTotalSales = 'uniform_online_total_sales'
}

export const ASM_LIST = [
  'ASM Dương Sơn Tùng',
  'ASM Nguyễn Văn Ánh',
  'ASM Đỗ Quang Hiếu'
]
