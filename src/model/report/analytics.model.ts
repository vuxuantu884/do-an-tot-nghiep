
export enum SUBMIT_MODE {
  GET_DATA = "GET_DATA",
  SAVE_QUERY = "SAVE_QUERY",
  EXPORT_EXCEL = "EXPORT_EXCEL",
  SAVE_NAME = "SAVE_NAME",
  DELETE_REPORT = "DELETE_REPORT",
  CLONE_REPORT = "CLONE_REPORT",
}

export enum GROUP_BY_TYPE {
  BY = "BY",
  OVER = "OVER",
}

export enum ORDER_TYPE {
  ASC = "ASC",
  DESC = "DESC",
}

export enum TIME {
  YEAR = 'year',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  YearNoChange = 'yearNoChange'
}

export enum FIELD_FORMAT {
  StringFormat = "string",
  Price = "price",
  NumberFormat = "number",
  Timestamp = "timestamp"
}

export enum AnalyticCube {
  Sales = 'sales',
  Payments = 'payments',
  Costs = 'costs',
  All = 'all',
  OfflineSales = 'offline_sales',
}

export enum ColumnType {
  Measure = "measure",
  Property = "property"
}

export enum TimeAtOptionValue {
  CreatedAt = `time:"created_at"`,
  FinalizedAt = `time:"finalized_at"`,
  CompletedAt = `time:"completed_at"`,
  CancelledAt = `time:"cancelled_at"`,
}

export enum FormFilterCustomReport {
  OnlyMyReport = 'onlyMyReport'
}

export declare type QueryMode = "table" | "chart"
export declare type ArrayString = Array<string>;
export declare type ArrayAny = Array<any>;
export declare type AnalyticConditions = Array<ArrayString>;

export interface AnalyticColumns {
  field: string;
  type?: string;
  format?: string;
}

export interface AnalyticQuery {
  columns: Array<AnalyticColumns>;
  rows?: Array<string>;
  cube: string;
  conditions?: AnalyticConditions;
  from?: string;
  to?: string;
  order_by?: Array<ArrayString>;
}

export interface AnalyticProperties {
  [key: string]: {
    [key: string]: string;
  };
}

export interface AnalyticAggregate {
  [key: string]: {
    name: string;
  };
}

export interface AnalyticMetadata {
  aggregates: AnalyticAggregate;
  properties: AnalyticProperties;
}

export interface AnalyticResult {
  columns: Array<AnalyticColumns>;
  data: Array<ArrayAny>;
  summary: Array<any>;
}
export interface AnalyticDataQuery extends AnalyticMetadata {
  query: AnalyticQuery;
  result: AnalyticResult;
}

export interface AnalyticTemplateParams {
  q: string;
  chart_q?: string;
  format?: "xls";
  options?: string;
}

export interface AnalyticQueryMany {
  q: Array<string>;
  options: Array<string>;
}

export interface AnalyticTemplateData {
  id: number;
  query: string;
  name: string;
  cube: string;
  alias: string[];
  iconImg: any;
  type: string;
  chartColumnSelected: string[];
  timeAtOption: string;
  chart_query?: string;
}

export interface AnalyticCustomizeTemplateForCreate {
  name: string;
  query: string;
  cube: string;
  chartColumnSelected: string[];
  timeAtOption: string;
  chart_query?: string;
}
export interface AnalyticCustomize {
  id?: number;
  name: string;
  query: string;
  group: string;
  chart_query?: string;
  options: string;
  created_by?: string;
}

export interface AnalyticChartInfo {
  showChart: boolean;
  message: string;
}

export interface AnnotationItem {
  annotation: string;
  desc: string;
}

export interface AnnotationData {
  data: AnnotationItem[];
  documentLink: string;
  alias: string;
  cubes: AnalyticCube[];
}

export interface AnalyticTemplateGroup {
  [key: string]: {
    cube: AnalyticCube;
    name: string;
  }[]
}

export interface AnalyticSampleQuery {
  query: AnalyticQuery;
  options: string;
}