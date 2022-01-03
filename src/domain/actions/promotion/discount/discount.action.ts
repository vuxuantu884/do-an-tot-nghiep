import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType, PriceRuleType} from "../../../types/promotion.type"; 
import { PriceRule, ProductEntitlements } from 'model/promotion/price-rules.model'; 

export const getListDiscountAction = (query: BaseQuery, setData: (data: PageResponse<PriceRule>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
}

export const promoGetDetail = (id: number, onResult: (result: PriceRule|false) => void) => {
  return BaseAction(DiscountType.GET_PROMO_CODE_DETAIL, {id, onResult});
}

export const getVariants = (id: number, onResult: (result: ProductEntitlements[]) => void) => {
  return BaseAction(DiscountType.GET_VARIANTS, {id, onResult});
}

export const discountGetDetail = (id: number, onResult: (result: PriceRule|false) => void) => {
  return BaseAction(DiscountType.GET_DISCOUNT_CODE_DETAIL, {id, onResult});
}

export const deletePriceRulesById = (id: number, onResult: (result: PriceRule|false) => void) => {
  return BaseAction(DiscountType.DELETE_PRICE_RULE_BY_ID, {id, onResult});
}

export const addPriceRules = (body: any, createCallback: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.ADD_PRICE_RULE, {body, createCallback});
}

export const bulkEnablePriceRulesAction = (body: any, enableCallback: (numberOfActived: number) => void) => {
  return BaseAction(DiscountType.ENABLE_PRICE_RULE, {body, enableCallback});
}

export const bulkDisablePriceRulesAction = (body: any, disableCallback: (numberOfDisabled: number) => void) => {
  return BaseAction(DiscountType.DISABLE_PRICE_RULE, {body, disableCallback});
}

export const bulkDeletePriceRules = (body: any, deleteCallback: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.DELETE_BULK_PRICE_RULE, {body, deleteCallback});
}

export const updatePriceRuleByIdAction = (body: any, onResult: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.UPDATE_PRICE_RULE_BY_ID, {body, onResult});
}

export const createPriceRuleAction = (body: Partial<PriceRule>, onResult: (result: PriceRule) => void) => {
  return BaseAction(PriceRuleType.CREATE_PRICE_RULE, {body, onResult});
}