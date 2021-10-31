import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType} from "../../../types/promotion.type";
import {ListPromotionCodeResponse} from './../../../../model/response/promotion/promotion-code/list-discount.response';

const getListPromotionCode = (query: BaseQuery, setData: (data: PageResponse<ListPromotionCodeResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_PROMOTION_CODE, { query, setData });
}

const getListDiscountCode = (query: BaseQuery, setData: (data: PageResponse<ListPromotionCodeResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNT_CODE, { query, setData });
}

export {
  getListPromotionCode
}