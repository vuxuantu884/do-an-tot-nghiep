import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType} from "../../../types/promotion.type";
import {DiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";

export const getListDiscount = (query: BaseQuery, setData: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
}

export const promoGetDetail = (id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.GET_PROMO_CODE_DETAIL, {id, onResult});
}

export const deletePriceRulesById = (id: number, onResult: (result: DiscountResponse|false) => void) => {
  return BaseAction(DiscountType.DELETE_PRICE_RULE_BY_ID, {id, onResult});
}

export const addPriceRules = (body: any, createCallback: (result: DiscountResponse) => void) => {
  return BaseAction(DiscountType.ADD_PRICE_RULE, {body, createCallback});
}