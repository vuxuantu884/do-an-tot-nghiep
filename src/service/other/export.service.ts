import { ExportRequest, ExportResponse } from "model/other/file/export-model";
import BaseAxios from "base/BaseAxios";
import BaseResponse from "base/BaseResponse";
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
