import BaseAction from "base/base.action";
import { BaseQuery } from "../../../../model/base/base.query";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import { DiscountType, PriceRuleType } from "domain/types/promotion.type";
import { PriceRule, ProductEntitlements } from "model/promotion/price-rules.model";
import { searchProductDiscountVariantQuery } from "model/discount/discount.model";

export const getListDiscountAction = (
  query: BaseQuery,
  setData: (data: PageResponse<PriceRule>) => void,
) => {
  return BaseAction(DiscountType.GET_LIST_DISCOUNTS, { query, setData });
};

export const getVariantsAction = (
  id: number,
  onResult: (result: ProductEntitlements[]) => void,
) => {
  return BaseAction(DiscountType.GET_VARIANTS, { id, onResult });
};

export const getPriceRuleVariantPaggingAction = (
  id: number,
  params: BaseQuery,
  onResult: (result: PageResponse<ProductEntitlements>) => void,
) => {
  return BaseAction(DiscountType.GET_PRICE_RULE_VARIANTS_PAGGING, {
    id,
    params,
    onResult,
  });
};

// export const discountGetDetail = (id: number, onResult: (result: PriceRule) => void) => {
//   return BaseAction(DiscountType.GET_DISCOUNT_CODE_DETAIL, {id, onResult});
// }

export const deletePriceRulesById = (id: number, onResult: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.DELETE_PRICE_RULE_BY_ID, { id, onResult });
};

export const addPriceRules = (body: PriceRule, createCallback: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.ADD_PRICE_RULE, { body, createCallback });
};

export const bulkEnablePriceRulesAction = (
  body: any,
  enableCallback: (numberOfActived: number) => void,
) => {
  return BaseAction(DiscountType.ENABLE_PRICE_RULE, { body, enableCallback });
};

export const bulkDisablePriceRulesAction = (
  body: any,
  disableCallback: (numberOfDisabled: number) => void,
) => {
  return BaseAction(DiscountType.DISABLE_PRICE_RULE, { body, disableCallback });
};

export const bulkDeletePriceRules = (body: any, deleteCallback: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.DELETE_BULK_PRICE_RULE, {
    body,
    deleteCallback,
  });
};

export const updatePriceRuleByIdAction = (
  body: Partial<PriceRule>,
  onResult: (result: PriceRule) => void,
) => {
  return BaseAction(DiscountType.UPDATE_PRICE_RULE_BY_ID, { body, onResult });
};

export const createPriceRuleAction = (
  body: Partial<PriceRule>,
  onResult: (result: PriceRule) => void,
) => {
  return BaseAction(PriceRuleType.CREATE_PRICE_RULE, { body, onResult });
};

export const getPriceRuleAction = (id: number, onResult: (result: PriceRule) => void) => {
  return BaseAction(DiscountType.GET_PRICE_RULE_DETAIL, { id, onResult });
};

export const searchProductDiscountVariantAction = (
  id: number,
  query: searchProductDiscountVariantQuery,
  setData: (data: ProductEntitlements) => void,
) => {
  return BaseAction(DiscountType.SEARCH_PRODUCT_DISCOUNT_VARIANT, { id, query, setData });
};
