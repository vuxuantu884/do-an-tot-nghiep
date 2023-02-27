import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import {
  StockInOutOther,
  StockInOutOtherData,
  StockInOutOtherPrint,
} from "model/stock-in-out-other";

const createStockInOutOthers = (data: StockInOutOtherData): Promise<BaseResponse<string>> => {
  return BaseAxios.post(`${ApiConfig.STOCK_IN_OUT}/other-stock-io`, data);
};

const getDetailStockInOutOthers = (id: number) => {
  return BaseAxios.get(`${ApiConfig.STOCK_IN_OUT}/other-stock-io/${id}`);
};

const updateStockInOutOthers = (
  id: number,
  data: StockInOutOtherData,
): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.STOCK_IN_OUT}/other-stock-io/${id}`, data);
};

const getStockInOutOtherList = (query?: string): Promise<BaseResponse<StockInOutOther>> => {
  return BaseAxios.get(`${ApiConfig.STOCK_IN_OUT}/other-stock-io?${query}`);
};

const cancelledMultipleStockInOut = (ids: string): Promise<BaseResponse<string>> => {
  return BaseAxios.put(`${ApiConfig.STOCK_IN_OUT}/other-stock-io/cancel?ids=${ids}`);
};

const printStockInOutOtherDetail = (id: number): Promise<BaseResponse<StockInOutOtherPrint>> => {
  return BaseAxios.get(
    `${ApiConfig.STOCK_IN_OUT}/other-stock-io/print?id=${id}&print_type=stock_in_out_other`,
  );
};

export {
  createStockInOutOthers,
  getDetailStockInOutOthers,
  updateStockInOutOthers,
  getStockInOutOtherList,
  cancelledMultipleStockInOut,
  printStockInOutOtherDetail,
};
