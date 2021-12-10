import {BaseQuery} from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {generateQuery} from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {DiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";
import { CouponRequestModel, DiscountRequestModel } from "model/request/promotion.request";
import { ApplyCouponResponseModel } from "model/response/order/promotion.response";

const END_POINT = "/price-rules";

export const searchDiscountList = (query: BaseQuery): Promise<BaseResponse<PageResponse<DiscountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/search?${params}`);
};

export const getPriceRuleById = (id: number) : Promise<DiscountResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}`);
}

export const getVariantApi = (id: number) : Promise<DiscountResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}/variants`);
}

export const deletePriceRuleById = (id: number): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}/${id}/cancel`);
}

export const createPriceRule = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}`, body);
}

export const bulkDeletePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/batch/cancel`, body)
}

export const bulkEnablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/batch/active`, body)
}

export const bulkDisablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/batch/disable`, body)
}

export const applyDiscount = (items: Array<any>, orderInfo:any, orderId?: number|null) : Promise<any> => {
  if (items === undefined) return Promise.reject(null);
  // return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`,
  const body: any = {
    order_id: orderId ? orderId : null,
    sales_channel_name: orderInfo.salesChannelName,
    store_id: orderInfo.storeId,
    order_source_id: orderInfo.orderSourceId,
    customer_id: orderInfo.customerId,
  };
  body["line_items"] = items.map(item => {
    return {
      "custom": true,
      "product_id": item.id,
      "variant_id": item.variant_id,
      "sku": item.sku,
      "quantity": item.quantity,

      "original_unit_price": item.price,
      "applied_discount": null,
      "taxable": true
    }
  })
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, body)
}


export const applyCouponService = (queryParams: CouponRequestModel): Promise<BaseResponse<ApplyCouponResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, queryParams)
};

export const applyDiscountService = (queryParams: DiscountRequestModel): Promise<BaseResponse<ApplyCouponResponseModel>> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`, queryParams)
};

export const updatePriceRuleById = (body: any) : Promise<DiscountResponse> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}/${body.id}`, body);
}