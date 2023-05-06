import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { CreateBinLocationData } from "model/bin-location";

export const createProductBinLocation = (
  data: CreateBinLocationData,
  storeId: string,
): Promise<BaseResponse<any>> => {
  return BaseAxios.post(`${ApiConfig.INVENTORY}/${storeId}/bin-transfer`, data);
};
