import { AxiosRequestConfig } from "axios";
import { DailyRevenueIncludeHeaderInfoBaseAxios } from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { AppConfig } from "config/app.config";
import { ImportFileModel, RevenueSearchQuery } from "model/revenue";
import { generateQuery } from "utils/AppUtils";

export const getDailyRevenueService = (
  request: RevenueSearchQuery,
  config?: AxiosRequestConfig,
): Promise<any> => {
  let newRequest = {
    page: Number((request.page || 1) - 1),
    size: request.limit || 30,
    "id.in": request.ids,
    "storeId.in": request.store_ids,
    "state.in": request.states,
    "date.equals": request.date,
    "date.greaterThanOrEqual": request.created_at_min,
    "date.lessThanOrEqual": request.created_at_max,
    "openedAt.greaterThanOrEqual": request.opened_at_min,
    "openedAt.lessThanOrEqual": request.opened_at_max,
    "closedAt.greaterThanOrEqual": request.closed_at_min,
    "closedAt.lessThanOrEqual": request.closed_at_max,
    "openedBy.in": request.opened_bys,
    "closedBy.in": request.closed_bys,
    "remainingAmount.greaterThanOrEqual": request.remaining_amount_min,
    "remainingAmount.lessThanOrEqual": request.remaining_amount_max,
    "otherCost.greaterThanOrEqual": request.other_cost_min,
    "otherCost.lessThanOrEqual": request.other_cost_max,
    "otherPayment.greaterThanOrEqual": request.other_payment_min,
    "otherPayment.lessThanOrEqual": request.other_payment_max,
    "totalPayment.greaterThanOrEqual": request.total_payment_min,
    "totalPayment.lessThanOrEqual": request.total_payment_max,
    "updatedAt.greaterThanOrEqual": request.update_at_min,
    "updatedAt.lessThanOrEqual": request.update_at_max,
    format: request.format,
  };
  let queryPath = generateQuery(newRequest);
  let link = `${AppConfig.baseApi}/api/daily-payments?${queryPath}`;
  return DailyRevenueIncludeHeaderInfoBaseAxios.get(link, config);
};

export const importOtherPaymentDailyRevenueService = (request: ImportFileModel): Promise<any> => {
  let link = `${AppConfig.baseApi}/api/daily-payments/other-payments/import`;
  return DailyRevenueIncludeHeaderInfoBaseAxios.post(link, request);
};

export const importPaymentConfirmDailyRevenueService = (request: ImportFileModel): Promise<any> => {
  let link = `${AppConfig.baseApi}/api/daily-payments/import-confirm-payment`;
  return DailyRevenueIncludeHeaderInfoBaseAxios.post(link, request);
};
export const confirmPayMoneyDailyRevenueService = (id: number): Promise<any> => {
  return DailyRevenueIncludeHeaderInfoBaseAxios.post(`${ApiConfig.DAILY_PAYMENT}/${id}/confirm`);
};

export const refreshDailyRevenueService = (id: number): Promise<any> => {
  return DailyRevenueIncludeHeaderInfoBaseAxios.post(`${ApiConfig.DAILY_PAYMENT}/${id}/refresh`);
};
