import BaseAction from 'base/base.action';
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {PromoCodeType} from "../../../types/promotion.type";
import {DiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";

export const getListPromoCode = (priceRuleId: number, setData: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(PromoCodeType.GET_LIST_PROMO_CODE, { priceRuleId, setData });
}

export const getPromoCodeById = (priceRuleId: number, id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.GET_PROMO_CODE_BY_ID, {priceRuleId, id, onResult});
}

export const deletePromoCodeById = (priceRuleId: number, id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.DELETE_PROMO_CODE_BY_ID, {priceRuleId, id, onResult});
}

export const updatePromoCodeById = (priceRuleId: number, body: any, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.UPDATE_PROMO_CODE_BY_ID, {priceRuleId, body, onResult});
}

export const addPromoCodeManual = (priceRuleId: number, body: any, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(PromoCodeType.ADD_PROMO_CODE_MANUAL, {priceRuleId, body, onResult});
}