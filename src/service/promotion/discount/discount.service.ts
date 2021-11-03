import {BaseQuery} from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {generateQuery} from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {DiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";

const END_POINT = "/price-rules";

export const searchDiscountList = (query: BaseQuery): Promise<BaseResponse<PageResponse<DiscountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/?${params}`);
};

export const getPriceRuleById = (id: number) : Promise<DiscountResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}`);
}

export const deletePriceRuleById = (id: number): Promise<any> => {
  return BaseAxios.delete(`${ApiConfig.PROMOTION}${END_POINT}/${id}`);
}

export const createPriceRule = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}`, body);
}

export const bulkDeletePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/delete`, body)
}

export const bulkEnablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/enable`, body)
}

export const bulkDisablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/disable`, body)
}
