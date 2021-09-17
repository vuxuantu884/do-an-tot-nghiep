import BaseAction from 'base/base.action';
import BaseResponse from 'base/base.response';
import { LoyaltyProgramType, LoyaltyRateType, LoyaltyUsageType } from 'domain/types/loyalty.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { BaseQuery } from 'model/base/base.query';
import { CreateLoyaltyAccumulationRequest } from 'model/request/loyalty/create-loyalty-accumulation.request';
import { LoyaltyAccumulationProgramResponse } from 'model/response/loyalty/loyalty-accumulation.response';
import { LoyaltyRateResponse } from 'model/response/loyalty/loyalty-rate.response';
import { LoyaltyUsageResponse } from 'model/response/loyalty/loyalty-usage.response';

const createLoyaltyAccumulationProgram = (query: CreateLoyaltyAccumulationRequest, setData: (data: BaseResponse<LoyaltyAccumulationProgramResponse>) => void) => {
  return BaseAction(LoyaltyProgramType.CREATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST, { query, setData });
}

const updateLoyaltyAccumulationProgram = (id: number, query: CreateLoyaltyAccumulationRequest, setData: (data: BaseResponse<LoyaltyAccumulationProgramResponse>) => void) => {
  return BaseAction(LoyaltyProgramType.UPDATE_LOYALTY_ACCUMULATION_PROGRAM_REQUEST, { id, query, setData });
}

const getLoyaltyAccumulationProgram = (id: number, setData: (data: LoyaltyAccumulationProgramResponse) => void) => {
  return BaseAction(LoyaltyProgramType.GET_LOYALTY_ACCUMULATION_PROGRAM_DETAIL, { id, setData });
}

const getListLoyaltyAccumulationProgram = (query: BaseQuery, setData: (data: PageResponse<LoyaltyAccumulationProgramResponse>) => void) => {
  return BaseAction(LoyaltyProgramType.GET_LOYALTY_ACCUMULATION_PROGRAM, { query, setData });
}

const getLoyaltyRate = (setData: (data: LoyaltyRateResponse) => void) => {
  return BaseAction(LoyaltyRateType.GET_LOYALTY_RATE_REQUEST, { setData });
}

const createLoyaltyRate = (addingRate: number | null, usageRate: number | null, enableUsingPoint: boolean, setData: (data: LoyaltyRateResponse) => void) => {
  return BaseAction(LoyaltyRateType.CREATE_LOYALTY_RATE_REQUEST, { addingRate, usageRate, enableUsingPoint, setData });
}

const getLoyaltyUsage = (setData: (data: Array<LoyaltyUsageResponse>) => void) => {
  return BaseAction(LoyaltyUsageType.GET_LOYALTY_USAGE_REQUEST, { setData });
}

const createLoyaltyUsage = (query: Array<LoyaltyUsageResponse>, setData: (data: Array<LoyaltyUsageResponse>) => void) => {
  return BaseAction(LoyaltyUsageType.CREATE_LOYALTY_USAGE_REQUEST, { query, setData });
}

export {
  createLoyaltyAccumulationProgram,
  getLoyaltyAccumulationProgram,
  updateLoyaltyAccumulationProgram,
  getLoyaltyRate,
  createLoyaltyRate,
  getLoyaltyUsage,
  createLoyaltyUsage,
  getListLoyaltyAccumulationProgram
};