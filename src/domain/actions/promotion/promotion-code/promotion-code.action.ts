import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType} from "../../../types/promotion.type";

const getPriceRules = (query: BaseQuery, setData: (data: PageResponse<any>) => void) => {
  return BaseAction(DiscountType.GET_PRICE_RULES, { query, setData });
}

const getListDiscountCode = (query: BaseQuery, setData: (data: PageResponse<any>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNT_CODE, { query, setData });
}

export {
  getPriceRules,
  getListDiscountCode
}