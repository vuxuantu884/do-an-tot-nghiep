import { PromoCodeResponse } from '../../../model/response/promotion/promo-code/list-promo-code.response';
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";

const END_POINT = "/price-rules";

export const checkPromoCode = (id : number): Promise<any> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}/discount-codes/lookup?code=${id}`);
};

export const getAllPromoCodeList = (priceRuleId: number): Promise<BaseResponse<PageResponse<PromoCodeResponse>>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes`);
};


export const getPromoCodeById = (priceRuleId: number, id: number): Promise<PromoCodeResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes/${id}`);
};

export const createPromoCode = (priceRuleId: number, body: any) : Promise<PromoCodeResponse> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes`, body);
}

export const deletePromoCodeById = (priceRuleId: number, id: number): Promise<PromoCodeResponse> => {
  return BaseAxios.delete(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes/${id}`);
};

export const deleteMultiPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes/bulk/delete`, body);
};

export const updatePromoCodeById = (priceRuleId: number, body: any): Promise<PromoCodeResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/discount-codes/${body.id}`, body);
};
