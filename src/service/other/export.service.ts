import { ExportRequest, ExportResponse } from "model/other/files/export-model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/ApiConfig";

export const exportFile = (
  params: ExportRequest
): Promise<BaseResponse<ExportResponse>> => {
  return BaseAxios.post(`${ApiConfig.IMPORT_EXPORT}/exporting/jobs`, params);
};
export const getFile = (
  code: string
): Promise<BaseResponse<ExportResponse>> => {
  return BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/exporting/jobs/${code}`);
};
