import { ImportRequest, ImportResponse } from "model/other/files/export-model";
import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { VariantModel } from "model/pack/pack.model";

export const exportFile = (
  params: ImportRequest
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY_ADJUSTMENT}/excel/job/export`, params);
};

export const exportFileV2 = (
  params: ImportRequest
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.post(`${ApiConfig.IMPORT_EXPORT}/exporting/jobs`,params);
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

export const getFileV2 = (
  code: string
): Promise<BaseResponse<ImportResponse>> => {
  return BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/exporting/jobs/${code}`);
}

export const getVariantByBarcode = (barcode: string): Promise<BaseResponse<VariantModel>> => {
  let link = `${ApiConfig.PRODUCT}/variants/barcode/${barcode}`;
  return BaseAxios.get(link);
};