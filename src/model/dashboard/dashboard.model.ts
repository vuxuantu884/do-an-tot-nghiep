import { AnalyticSampleQuery } from "model/report/analytics.model";
export interface MonthIncomeQuery {
  departmentId?: number;
  isSeeMyData?: boolean;
} 
export interface Warehouse {
  name: string;
  id: number;
}
export interface GoodsAreComingItem {
  to: Warehouse;
  from: Warehouse;
  time: string;
  quantity: number;
  price: number;
}

export interface GoodsAreComing {
  total: number;
  data: Array<GoodsAreComingItem>;
}

export interface OrderStatus {
  name: string;
  quantity: number;
  income: number;
  rate: number;
}
//========================================================================================
export enum BusinessResultChartKey {
  CURRENT_MONTH = "CURRENT_MONTH",
  AVERAGE_OF_LAST_3_MONTH = "AVERAGE_OF_LAST_3_MONTH",
  DAY = "DAY",
}

export interface DayTotalSale {
  currentMonth: number;
  averageOfLastThreeMonth: number;
  day: string;
}

export interface BusinessResultChart {
  monthTotalSalesOverDay: Array<DayTotalSale>;
  totalSalesToday: number;
}

export interface BusinessResultCartItem {
  value: number;
  monthlyAccumulated: number;
}

export interface BusinessResultTemplate {
  name: string;
  template: AnalyticSampleQuery;
}

export interface DashboardTopSale {
  label: string;
  totalSales?: number;
  averageOrder?: number;
  description?: string;
  top?: number;
}

export interface DashboardTopProduct {
  label: string;
  total_sales: number;
  net_quantity: number;
  description?: string;
}