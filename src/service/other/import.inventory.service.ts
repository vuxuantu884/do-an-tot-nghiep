import { ImportRequest, ImportResponse } from "model/other/files/export-model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";

export const exportFile = (
  params: ImportRequest
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/excel/job/export`, params);
};

export const importFile = (
  params: ImportRequest
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/excel/job/import`, params);
};

export const getFile = (
  code: string
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY_ADJUSTMENT}/excel/job/${code}`);
};
