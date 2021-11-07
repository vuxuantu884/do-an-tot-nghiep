import {BaseQuery} from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {generateQuery} from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {DiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";
import {OrderLineItemRequest} from "../../../model/request/order.request";

const END_POINT = "/price-rules";

export const searchDiscountList = (query: BaseQuery): Promise<BaseResponse<PageResponse<DiscountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/search?${params}`);
};

export const getPriceRuleById = (id: number) : Promise<DiscountResponse> => {
  return BaseAxios.get(`${ApiConfig.PROMOTION}${END_POINT}/${id}`);
}

export const deletePriceRuleById = (id: number): Promise<any> => {
  return BaseAxios.put(`${ApiConfig.PROMOTION}${END_POINT}/${id}/cancel`);
}

export const createPriceRule = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}`, body);
}

export const bulkDeletePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/cancel`, body)
}

export const bulkEnablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/active`, body)
}

export const bulkDisablePriceRules = (body: any) : Promise<any> => {
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/bulk/disable`, body)
}

export const applyDiscount = (item: OrderLineItemRequest | undefined, quantity: number) : Promise<any> => {
  if (item === undefined) return Promise.reject(null);
  return BaseAxios.post(`${ApiConfig.PROMOTION}${END_POINT}/apply`,
    {
      "order_id": null,
      "customer_id": null,
      "store_id": null,
      "sales_channel_name": "ADMIN",
      "order_source_id": null,
      "line_items": [
        {
          "custom": true,
          "product_id": null,
          "variant_id": item.variant_id,
          "sku": null,
          "quantity": quantity,
          "original_unit_price": 0,
          "applied_discount": {
            "discount_code": "string",
            "title": "string",
            "value_type": "FIXED_AMOUNT",
            "value": 0
          },
          "taxable": true
        }
      ],
      "applied_discount": {
        "discount_code": "string",
        "title": "string",
        "value_type": "FIXED_AMOUNT",
        "value": 0
      },
      "taxes_included": false,
      "tax_exempt": false
    }
  )
}
