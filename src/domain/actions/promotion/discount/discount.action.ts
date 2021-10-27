import BaseAction from 'base/base.action';
import {BaseQuery} from "../../../../model/base/base.query";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {DiscountType} from "../../../types/promotion.type";
import {ListDiscountResponse} from "../../../../model/response/promotion/discount/list-discount.response";

const getListDiscount = (query: BaseQuery, setData: (data: PageResponse<ListDiscountResponse>) => void) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
}

export {
  getListDiscount
}