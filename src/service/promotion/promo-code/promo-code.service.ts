import { generateQuery } from './../../../utils/AppUtils';
import BaseAxios from "../../../base/base.axios";
import BaseResponse from "../../../base/base.response";
import {PromoCodeResponse} from '../../../model/response/promotion/promo-code/list-promo-code.response';
import {BaseQuery} from './../../../model/base/base.query';
import {PageResponse} from "../../../model/base/base-metadata.response";
import {ApiConfig} from "../../../config/api.config";

const END_POINT = "/price-rules/";

export const checkPromoCode = (id : number): Promise<PromoCodeResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}/discount-codes/lookup?code=${id}`);
};

export const getAllPromoCodeList = (priceRuleId: number, query: BaseQuery): Promise<BaseResponse<PageResponse<PromoCodeResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes?${params}`);
};


export const getPromoCodeById = (priceRuleId: number, id: number): Promise<PromoCodeResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const createPromoCode = (priceRuleId: number, body: any) : Promise<PromoCodeResponse> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes`, body);
}

export const deletePromoCodeById = (priceRuleId: number, id: number): Promise<PromoCodeResponse> => {
  return BaseAxios.delete(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const deleteBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch/discount-codes/delete`, body);
};

export const updatePromoCodeById = (priceRuleId: number, body: any): Promise<PromoCodeResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${body.id}`, body);
};

export const addPromoCode = (priceRuleId: number, body: any): Promise<PromoCodeResponse> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch`, body);
};