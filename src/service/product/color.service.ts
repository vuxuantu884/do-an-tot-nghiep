
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
import { ApiConfig } from "config/ApiConfig";
import { PageResponse } from "model/response/base-metadata.response";
import { generateQuery } from "utils/AppUtils";
import { SearchColorQuery } from '../../model/query/search.color.query';
import { ColorResponse } from "../../model/response/products/color.response";

export const searchColorApi = (query: SearchColorQuery): Promise<BaseResponse<PageResponse<ColorResponse>>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.PRODUCT}/colors?${queryString}`);
}

