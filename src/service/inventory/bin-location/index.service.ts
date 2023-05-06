import BaseResponse from "base/base.response";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { BinLocationSearchQuery } from "model/bin-location";

const getListBinLocationApi = (
  id: number,
  params: BinLocationSearchQuery,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY}/${id}/bin-location`, {
    params,
  });
};

const getListBinLocationHistoryApi = (
  id: number,
  params: BinLocationSearchQuery,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY}/${id}/bin-transfer`, {
    params,
  });
};

const getListBinLocationSumApi = (id: number, params: any): Promise<BaseResponse<any>> => {
  return BaseAxios.get(`${ApiConfig.INVENTORY}/${id}/bin-location/summary`, {
    params
  });
};

export { getListBinLocationApi, getListBinLocationHistoryApi, getListBinLocationSumApi };
