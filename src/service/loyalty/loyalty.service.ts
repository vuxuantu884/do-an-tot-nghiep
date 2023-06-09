import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import { CreateLoyaltyAccumulationRequest } from "model/request/loyalty/create-loyalty-accumulation.request";
import {
  CreateCustomerPointAdjustmentRequest,
  getImportCodeCustomerAdjustmentRequest,
} from "model/request/loyalty/loyalty.request";
import { UpdateLoyaltyPoint } from "model/request/loyalty/update-loyalty-point.request";
import { LoyaltyAccumulationProgramResponse } from "model/response/loyalty/loyalty-accumulation.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { generateQuery } from "utils/AppUtils";

export const createLoyaltyProgram = (
  query: CreateLoyaltyAccumulationRequest,
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-programs`, query);
};

export const updateLoyaltyProgram = (
  id: number,
  query: CreateLoyaltyAccumulationRequest,
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.put(`${ApiConfig.LOYALTY}/loyalty-programs/${id}`, query);
};

export const getLoyaltyProgramDetail = (
  id: number,
): Promise<BaseResponse<LoyaltyAccumulationProgramResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-programs/${id}`);
};

export const getLoyaltyRate = (): Promise<BaseResponse<LoyaltyRateResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-rates`);
};

export const createLoyaltyRate = (
  addingRate: number,
  usageRate: number,
  enableUsingPoint: boolean,
): Promise<BaseResponse<LoyaltyRateResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-rates`, {
    adding_rate: addingRate,
    usage_rate: usageRate,
    enable_using_point: enableUsingPoint,
  });
};

export const getLoyaltyUsage = (): Promise<BaseResponse<LoyaltyUsageResponse>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-usage-rules`);
};

export const createLoyaltyUsage = (
  query: Array<LoyaltyUsageResponse>,
): Promise<BaseResponse<LoyaltyUsageResponse>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-usage-rules`, {
    rules: query,
  });
};

export const searchLoyaltyProgramList = (
  query: BaseQuery,
): Promise<BaseResponse<PageResponse<LoyaltyUsageResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-programs?${params}`);
};

export const getLoyaltyPoint = (customerId: number): Promise<BaseResponse<LoyaltyPoint>> => {
  let link = `${ApiConfig.LOYALTY}/loyalty-points/customer/${customerId}`;
  return BaseAxios.get(link);
};

export const addLoyaltyPointService = (
  customerId: number,
  params: UpdateLoyaltyPoint,
): Promise<BaseResponse<LoyaltyPoint>> => {
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/loyalty-points/customer/${customerId}/add-instant`,
    params,
  );
};

export const subtractLoyaltyPointService = (
  customerId: number,
  params: UpdateLoyaltyPoint,
): Promise<BaseResponse<LoyaltyPoint>> => {
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/loyalty-points/customer/${customerId}/subtract-instant`,
    params,
  );
};

export const getLoyaltyAdjustMoneyService = (
  customerId: number,
): Promise<BaseResponse<LoyaltyPoint>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/adjustments/customers/${customerId}`);
};

export const getPointAdjustmentListService = (query: any): Promise<BaseResponse<any>> => {
  const params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/adjustments/admin?${params}`);
};

export const getPointAdjustmentDetailService = (adjustmentId: any): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/adjustments/${adjustmentId}`);
};

export const createCustomerPointAdjustmentService = (
  params: CreateCustomerPointAdjustmentRequest,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.LOYALTY}/adjustments`, params);
};

export const getImportCodeCustomerAdjustmentService = (
  params: getImportCodeCustomerAdjustmentRequest,
) => {
  let formData = new FormData();
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, value);
  }

  return BaseAxios.post(`${ApiConfig.LOYALTY}/adjustments/import`, formData, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const getInfoAdjustmentByJobService = (code: any): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.LOYALTY}/jobs/${code}`);
};

export const getRecalculatePointCustomerService = (
  customerId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/recalculate/customer/${customerId}/recalculate-point/apply`,
  );
};
export const getRecalculateMoneyCustomerService = (
  customerId: number,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(
    `${ApiConfig.LOYALTY}/recalculate/customer/${customerId}/recalculate-money/apply`,
  );
};
