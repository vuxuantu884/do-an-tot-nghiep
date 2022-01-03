import { generateQuery } from './../../../utils/AppUtils';
import BaseAxios from "../../../base/base.axios";
import BaseResponse from "../../../base/base.response"; 
import {BaseQuery} from './../../../model/base/base.query';
import {PageResponse} from "../../../model/base/base-metadata.response";
import {ApiConfig} from "../../../config/api.config";
import { DiscountCode } from 'model/promotion/price-rules.model';

const END_POINT = "/price-rules/";

export const checkPromoCode = (code : string): Promise<any> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}/discount-codes/lookup?code=${code}`);
};

export const getAllPromoCodeList = (priceRuleId: number, query: BaseQuery): Promise<BaseResponse<PageResponse<DiscountCode>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes?${params}`);
};


export const getPromoCodeById = (priceRuleId: number, id: number): Promise<DiscountCode> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const createPromoCode = (priceRuleId: number, body: any) : Promise<DiscountCode> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes`, body);
}

export const deletePromoCodeById = (priceRuleId: number, id: number): Promise<DiscountCode> => {
  return BaseAxios.delete(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${id}`);
};

export const deleteBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch/discount-codes/delete`, body);
};

export const publishedBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/published`, body);
};

export const enableBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/enable`, body);
};

export const disableBulkPromoCode = (priceRuleId: number, body: any): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/bulk/disable`, body);
};

export const updatePromoCodeById = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/discount-codes/${body.id}`, body);
};

export const addPromoCode = (priceRuleId: number, body: any): Promise<DiscountCode> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}${priceRuleId}/batch`, body);
};
