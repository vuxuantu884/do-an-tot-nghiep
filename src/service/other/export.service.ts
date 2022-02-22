import { RequestExportExcelQuery } from "model/query/ecommerce.query";
import { ExportRequest, ExportResponse, ExportProductResponse} from "model/other/files/export-model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";

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

export const exportFileProduct = (
  params: RequestExportExcelQuery
): Promise<BaseResponse<ExportProductResponse>> => {
  return BaseAxios.post(`${ApiConfig.ECOMMERCE}/import-export/variants-export`, params);
};

export const getFileProduct = (
  process_id: number
): Promise<BaseResponse<ExportProductResponse>> => {
  return BaseAxios.get(`${ApiConfig.ECOMMERCE}${ApiConfig.IMPORT_EXPORT}/${process_id}`);
};
