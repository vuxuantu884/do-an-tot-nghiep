import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  GoodsAreComing,
  MonthIncome,
  MonthIncomeQuery,
  OrderStatus,
  ProductGroupIncome,
  RankIncome,
} from "model/dashboard/dashboard.model";

const END_POINT = `${ApiConfig.DASHBOARD}/dashboard/statistical`;

export const getMonthIncomeService = (params: MonthIncomeQuery): Promise<BaseResponse<MonthIncome>> => {
  const url = `${END_POINT}/month-income`;
  return BaseAxios.get(url, { params });
};

export const getRankIncomeService = (params: MonthIncomeQuery): Promise<BaseResponse<RankIncome>> => {
  const url = `${END_POINT}/ranking-income`;
  return BaseAxios.get(url, { params });
};

export const getProductGroupIncomeService = (params: MonthIncomeQuery): Promise<BaseResponse<ProductGroupIncome[]>> => {
  const url = `${END_POINT}/product-group-income`;
  return BaseAxios.get(url, { params });
};
export const getOrderStatusService = (params: MonthIncomeQuery): Promise<BaseResponse<OrderStatus[]>> => {
  const url = `${END_POINT}/order-status`;
  return BaseAxios.get(url, { params });
};
export const getGoodAreComingService = (params: MonthIncomeQuery): Promise<BaseResponse<GoodsAreComing[]>> => {
  const url = `${END_POINT}/goods-are-coming`;
  return BaseAxios.get(url, { params });
};

 