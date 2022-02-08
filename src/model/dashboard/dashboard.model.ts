export enum AmountTimeMonthFilter {
  TO_DAY = "TO_DAY",
  YESTERDAY = "YESTERDAY",
  THIS_WEEK = "THIS_WEEK",
  LAST_WEEK = "LAST_WEEK",
}

export interface MonthIncomeQuery {
  amountTime?: AmountTimeMonthFilter;
  departmentId?: number;
  isSeeMyData?: boolean;
}

export interface DayIncome {
  current_month: number;
  average_of_previous_three_month: number;
  day_of_month: string;
}
export interface IncomeChart {
  month_income_list: Array<DayIncome>;
  income_of_today: number;
}

export interface IncomeCartItem {
  income: number;
  monthlyAccumulated: number;
}
export interface IncomeCard {
  cancel_income: IncomeCartItem;
  online_income: IncomeCartItem;
  offline_income: IncomeCartItem;
  average_order: IncomeCartItem;
  return_income: IncomeCartItem;
  success_rate: IncomeCartItem;
  conversion_rate: IncomeCartItem;
}
export interface MonthIncome {
  income_chart: IncomeChart;
  income_card: IncomeCard;
}

export interface RankIncomeItem {
  label: string;
  retail_income?: number;
  average_of_retail_income?: number;
}

export interface RankIncome {
  user_income_list: Array<RankIncomeItem>;
  store_income_list: Array<RankIncomeItem>;
  department_income_list: Array<RankIncomeItem>;
}

export interface ProductGroupIncome {
  product_group_name: string;
  income: number;
}
export interface ProductGroupQuantity {
  product_group_name: string;
  quantity: number;
}

export interface ProductGroup {
  product_group_incomes: Array<ProductGroupIncome>;
  product_group_quantities: Array<ProductGroupQuantity>;
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
