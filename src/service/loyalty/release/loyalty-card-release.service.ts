import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BaseQuery } from "model/base/base.query";
import { LoyaltyCardReleaseResponse } from "model/response/loyalty/release/loyalty-card-release.response";
import { generateQuery } from "utils/AppUtils";

export const loyaltyCardUploadApi = (
  file: File,
  name: string
): Promise<BaseResponse<LoyaltyCardReleaseResponse>> => {
  let body = new FormData();
  body.append("name", name);
  body.append("file", file);
  return BaseAxios.post(`${ApiConfig.LOYALTY}/loyalty-card-release`, body, {
    headers: { "content-type": "multipart/form-data" },
  });
};

export const searchLoyaltyCardReleaseList = (query: BaseQuery): Promise<BaseResponse<any>> => {
  let params = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.LOYALTY}/loyalty-card-release/jobs?${params}`);
};

// get loyalty card release jobs api
export const getLoyaltyCardReleaseJobsApi = (
    process_id: any
): Promise<BaseResponse<any>> => {
  const requestUrl = `${ApiConfig.LOYALTY}/loyalty-card-release/jobs/${process_id}`;
  return BaseAxios.get(requestUrl);
};
