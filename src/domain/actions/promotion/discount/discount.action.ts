import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType} from "../../../types/promotion.type";
import {DiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";

export const getListDiscount = (query: BaseQuery, setData: (data: PageResponse<DiscountResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
}
