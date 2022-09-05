export interface KeyDriverImportFileParams {
  headRow: number;
  type: EntityName;
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
  time: "month" | "day";
}

export interface KeyDriverParams {
  ["year.equals"]: number;
  ["month.equals"]: number;
  ["day.equals"]?: number;
}

export interface KDOfflineTotalSalesParams {
  from: string;
  to: string;
  posLocationNames: string[];
  departmentLv2s: string[];
  staffCodes?: string[];
}

export enum KeyDriverField {
  TotalSales = "total_sales",
  OfflineTotalSales = "offline_total_sales",
  AverageCustomerSpent = "average_customer_spent",
  AverageOrderValue = "average_order_value",
  Visitors = "visitors",
  ConvertionRate = "convertion_rate",
  CustomersCount = "customers_count",
  VipTotalSales = "vip_total_sales",
  NearVipTotalSales = "near_vip_total_sales",
  BirthdayTotalSales = "birthday_total_sales",
  CustomerGt90DaysTotalSales = "customer_gt90_days_total_sales",
  ShopperGt90DaysTotalSales = "shopper_gt90_days_total_sales",
  CustomerLte90DaysTotalSales = "customer_lte90_days_total_sales",
  ShopperLte90DaysTotalSales = "shopper_lte90_days_total_sales",
  NewCustomerTotalSales = "new_customer_total_sales",
  OthersTotalSales = "others_total_sales",
  FacebookTotalSales = "facebook_total_sales",
  ZaloSotalSales = "zalo_total_sales",
  UniformTotalSales = "uniform_total_sales",
  UniformOnlineTotalSales = "uniform_online_total_sales",
  ProductTotalSales = "product_total_sales",
  FacebookFollows = "facebook_follows",
  PotentialCustomerCount = "potential_customer_count",
  NewCustomersConversionRate = "new_customers_conversion_rate",
  NewCustomersCount = "new_customers_count",
}

export const ASM_LIST = ["ASM Dương Sơn Tùng", "ASM Nguyễn Văn Ánh", "ASM Đỗ Quang Hiếu"];

export enum CustomerPhoneSMSCountersFilter {
  StoreIds = "storeIds",
  Month = "month",
  Year = "year",
  LoyaltyLevel = "loyaltyLevel",
  EntityName = "entityName",
  DataSource = "dataSource",
}

export enum EntityName {
  SMS = "sms",
  CALL = "phone_calls",
}

export enum LoyaltyLevel {
  VipS = "VIP S",
  VipG = "VIP G",
  VipR = "VIP R",
  VipD = "VIP D",
  CanVip = "Cận VIP",
  SieuVip = "SIÊU VIP",
  Birthday = "BIRTHDAY",
  Customer = "CUSTOMER",
  Shopper = "SHOPPER",
  New = "NEW",
  Others = "OTHERS",
}

export enum DataSource {
  MyData = "MyData",
  StoreData = "StoreData",
}

export const entityNames = [
  {
    name: "Cuộc gọi",
    value: EntityName.CALL,
  },
  {
    name: "SMS",
    value: EntityName.SMS,
  },
];

export const dataSources = [
  {
    name: "Dữ liệu của tôi",
    value: DataSource.MyData,
  },
  {
    name: "Dữ liệu toàn cửa hàng",
    value: DataSource.StoreData,
  },
];

export interface CustomerPhoneSMSCountersParams {
  month: number;
  year: number;
  storeIds?: number[];
  entityName: EntityName;
  loyaltyLevel?: LoyaltyLevel;
  reportedBy?: string;
  mergeLoyaltyLevel?: boolean;
}

export enum KDGroup {
  TotalSales = "_TotalSales",
  SKU3 = "_SKU3",
}

export enum PotentialImportingForm {
  Source = "source",
  Store = "store",
  FileUpload = "fileUpload",
}

export enum PotentialImportingSource {
  REGIST = "REGIST",
  BOUGHT = "BOUGHT",
}

export interface KeyDriverOnlineDataSourceType {
  key: string;
  title: string;
  method?: string;
  hideInput?: boolean;
  [key: string]: any; // giá trị hiển thị
  children: KeyDriverOnlineDataSourceType[];
}

export interface MonthlyCounter {
  entity_name: string;
  entity_key: string;
  year: number;
  month: number;
  department_lv1: string;
  department_lv2?: string;
  department_lv3?: string;
  account_code?: string;
  account_name?: string;
  account_role?: string;
  total?: number;
  [key: string]: any;
}

export interface KeyDriverOnlineParams {
  date: string;
  keyDriverGroupLv1: string;
  departmentLv2: string | null;
  departmentLv3: string | null;
}

export interface KeyCounterParams {
  "entityName.in": string[];
  "year.equals": number;
  "month.equals": number;
  "departmentLv1.equals": string;
  "departmentLv2.equals": string;
  "departmentLv3.equals": string;
}

export type DepartmentLevelGroup = {
  department_lv1: string;
  department_lv2: string;
  department_lv3: string;
  department_lv4: string;
  account_code: string;
  account_name: string;
  account_role: string;
};

export type DepartmentLevel4 = Omit<DepartmentLevelGroup, "department_lv2" | "department_lv3">;

export enum KeyDriverDimension {
  Asm = "Asm",
  Store = "Store",
  Staff = "Staff",
}

export enum KeyDriverFilter {
  Date = "date",
  Rank = "rank",
}

export interface TargetInfo {
  departmentKey: string;
  kdTarget: KeyDriverTarget[];
  date: string;
}
