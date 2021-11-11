import BaseAction from 'base/base.action';
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {PromoCodeType} from "../../../types/promotion.type";
import {DiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";
import {BaseQuery} from './../../../../model/base/base.query';

export const checkPromoCode = (code: string, handleResponse: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(PromoCodeType.CHECK_PROMO_CODE, { code, handleResponse });
}

export const getListPromoCode = (priceRuleId: number, query: BaseQuery, setData: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(PromoCodeType.GET_LIST_PROMO_CODE, { priceRuleId, query, setData });
}

export const getPromoCodeById = (priceRuleId: number, id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.GET_PROMO_CODE_BY_ID, {priceRuleId, id, onResult});
}

export const deletePromoCodeById = (priceRuleId: number, id: number, deleteCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.DELETE_PROMO_CODE_BY_ID, {priceRuleId, id, deleteCallBack});
}

export const updatePromoCodeById = (priceRuleId: number, body: any, updateCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, {priceRuleId, body, updateCallBack});
}

export const addPromoCode = (priceRuleId: number, body: any, addCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.ADD_PROMO_CODE, {priceRuleId, body, addCallBack});
}

export const deleteBulkPromoCode = (priceRuleId: number, body: any, deleteCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.DELETE_PROMO_CODE_BULK, {priceRuleId, body, deleteCallBack});
}

export const publishedBulkPromoCode = (priceRuleId: number, body: any, publishedCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.PUBLISHED_PROMO_CODE_BULK, {priceRuleId, body, publishedCallBack});
}
export const enableBulkPromoCode = (priceRuleId: number, body: any, enableCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.ENABLE_PROMO_CODE_BULK, {priceRuleId, body, enableCallBack});
}
export const disableBulkPromoCode = (priceRuleId: number, body: any, disableCallBack: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.DISABLE_PROMO_CODE_BULK, {priceRuleId, body, disableCallBack});
}