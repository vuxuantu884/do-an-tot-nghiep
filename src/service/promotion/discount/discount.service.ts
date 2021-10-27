import {BaseQuery} from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {generateQuery} from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {ListDiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";

export const searchDiscountList = (query: BaseQuery): Promise<BaseResponse<PageResponse<ListDiscountResponse>>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`http://localhost:3004${ApiConfig.PROMOTION}/discounts?${params}`);
};
