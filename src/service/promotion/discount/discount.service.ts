import { BaseQuery } from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import { PageResponse } from "../../../model/base/base-metadata.response";
import { generateQuery } from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import { ApiConfig } from "../../../config/api.config";
import { CouponRequestModel, DiscountRequestModel } from "model/request/promotion.request";
import { ApplyCouponResponseModel } from "model/response/order/promotion.response";
import { PriceRule, ProductEntitlements } from "model/promotion/price-rules.model";
import { searchProductDiscountVariantQuery } from "model/discount/discount.model";

const END_POINT = "/price-rules";
const PRICE_RULE_ENTITLEMENTS = "/price-rule-entitlements";

export const searchDiscountList = (
  query: BaseQuery,
): Promise<BaseResponse<PageResponse<PriceRule>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}?${params}`);
};

export const getPriceRuleById = (id: number): Promise<PriceRule> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}/${id}`);
};

export const getVariantApi = (id: number): Promise<PriceRule> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}/variants`);
};

export const getPriceRuleVariantApi = (
  id: number,
  params?: BaseQuery,
): Promise<BaseResponse<PageResponse<PriceRule>>> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}/variant-items`, { params });
};

export const deletePriceRuleById = (id: number): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}/${id}/cancel`);
};

export const createPriceRule = (discountForm: Partial<PriceRule>): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}`, discountForm);
};

export const bulkDeletePriceRules = (body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/batch/cancel`, body);
};

export const bulkEnablePriceRules = (body: any): Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}/bulk/active`, body);
};

export const bulkDisablePriceRules = (body: any): Promise<BaseResponse<{ count: number }>> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}/bulk/disable`, body);
};

export const applyDiscount = (
  items: Array<any>,
  orderInfo: any,
  orderId?: number | null,
): Promise<any> => {
  if (items === undefined) return Promise.reject(null);
  // return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`,
  const body: any = {
    order_id: orderId ? orderId : null,
    sales_channel_name: orderInfo.salesChannelName,
    store_id: orderInfo.storeId,
    order_source_id: orderInfo.orderSourceId,
    customer_id: orderInfo.customerId,
  };
  body["line_items"] = items.map((item) => {
    return {
      custom: true,
      product_id: item.id,
      variant_id: item.variant_id,
      sku: item.sku,
      quantity: item.quantity,

      original_unit_price: item.price,
      applied_discount: null,
      taxable: true,
    };
  });
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, body);
};

export const applyCouponService = (
  queryParams: CouponRequestModel,
): Promise<BaseResponse<ApplyCouponResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, queryParams);
};

export const applyDiscountService = (
  queryParams: DiscountRequestModel,
): Promise<BaseResponse<ApplyCouponResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, queryParams);
};

export const updatePriceRuleById = (body: any): Promise<PriceRule> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${PRICE_RULE_ENTITLEMENTS}/${body.id}`, body);
};

export const exportDiscountCode = (priceRuleId: any): Promise<any> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${priceRuleId}/export`);
};

export const searchProductDiscountVariantApi = (
  id: number,
  query: searchProductDiscountVariantQuery,
): Promise<BaseResponse<PageResponse<ProductEntitlements>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}/variant-items?${queryString}`);
};
