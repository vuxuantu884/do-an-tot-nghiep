import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType, PriceRuleType} from "../../../types/promotion.type";
import {DiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";
import { ProductEntitlements } from 'model/promotion/discount.create.model';
import { PriceRuleFormRequest } from 'model/request/promotion/price-rule.request';

export const getListDiscount = (query: BaseQuery, setData: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
}

export const promoGetDetail = (id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.GET_PROMO_CODE_DETAIL, {id, onResult});
}

export const getVariants = (id: number, onResult: (result: ProductEntitlements[]) => void) => {
  return BaseAction(DiscountType.GET_VARIANTS, {id, onResult});
}

export const discountGetDetail = (id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.GET_DISCOUNT_CODE_DETAIL, {id, onResult});
}

export const deletePriceRulesById = (id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.DELETE_PRICE_RULE_BY_ID, {id, onResult});
}

export const addPriceRules = (body: any, createCallback: (result: DiscountResponse) => void) => {
  return BaseAction(DiscountType.ADD_PRICE_RULE, {body, createCallback});
}

export const bulkEnablePriceRules = (body: any, enableCallback: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.ENABLE_PRICE_RULE, {body, enableCallback});
}

export const bulkDisablePriceRules = (body: any, disableCallback: (numberOfDeleted: number) => void) => {
  return BaseAction(DiscountType.DISABLE_PRICE_RULE, {body, disableCallback});
}

export const bulkDeletePriceRules = (body: any, deleteCallback: (result: DiscountResponse) => void) => {
  return BaseAction(DiscountType.DELETE_BULK_PRICE_RULE, {body, deleteCallback});
}

export const updatePriceRuleByIdAction = (body: any, onResult: (result: DiscountResponse) => void) => {
  return BaseAction(DiscountType.UPDATE_PRICE_RULE_BY_ID, {body, onResult});
}

export const createPriceRuleAction = (body: PriceRuleFormRequest, onResult: (result: DiscountResponse) => void) => {
  return BaseAction(PriceRuleType.CREATE_PRICE_RULE, {body, onResult});
}