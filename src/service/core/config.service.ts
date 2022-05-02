import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { FilterConfig, FilterConfigRequest } from "model/other";

export const createFilterConfigService = (
  request: FilterConfigRequest
): Promise<BaseResponse<FilterConfig>> => {
  return BaseAxios.post(
    `${ApiConfig.CORE}/config`,
      request
  );
};

export const updateFilterConfigService = (
  request: FilterConfigRequest
): Promise<BaseResponse<FilterConfig>> => {
  return BaseAxios.post(
    `${ApiConfig.CORE}/config`,
      request
  );
};

export const getFilterConfigService = (
  userCode: string
): Promise<BaseResponse<Array<FilterConfig>>> => {
  return BaseAxios.get(
    `${ApiConfig.CORE}/config/${userCode}`,
  );
};

export const deleteFilterConfigService = (
  id: number
): Promise<BaseResponse<Array<FilterConfig>>> => {
  return BaseAxios.delete(
    `${ApiConfig.CORE}/config/${id}`,
  );
};