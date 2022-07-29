import { OrderResponse } from "./../../model/response/order/order.response";
import { generateQuery } from "./../../utils/AppUtils";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import BaseResponse from "base/base.response";
import {
  GoodsReceiptsAddOrderRequest,
  GoodsReceiptsResponse,
  GoodsReceiptsTypeResponse,
  OrderConcernGoodsReceiptsResponse,
} from "./../../model/response/pack/pack.response";
import {
  GoodsReceiptsDeleteRequest,
  GoodsReceiptsRequest,
} from "./../../model/request/pack.request";

/**
 * lấy danh sách loại biên bản
 */
export const getGoodsReceiptsTypeService = (): Promise<BaseResponse<GoodsReceiptsTypeResponse>> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/types`;
  return BaseAxios.get(link);
};

/**
 * tạo biên bản bàn giao
 */
export const createGoodsReceiptsService = (
  params: GoodsReceiptsRequest,
): Promise<BaseResponse<GoodsReceiptsResponse>> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts`;
  return BaseAxios.post(link, params);
};

/**
 * cập nhật biên bản bàn giao
 */
export const updateGoodsReceiptsService = (
  goodsReceiptsId: number,
  params: GoodsReceiptsRequest,
): Promise<BaseResponse<GoodsReceiptsResponse>> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts/${goodsReceiptsId}`;
  return BaseAxios.put(link, params);
};

/**
 * lấy thông tin biên bản bàn giao
 */
export const getByIdGoodsReceiptsService = (goodsReceiptsId: number) => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts/${goodsReceiptsId}`;
  return BaseAxios.get(link);
};

/**
 * xóa biên bản bàn giao
 */
export const deleteGoodsReceiptsService = (
  goodsReceiptsId: number,
): Promise<BaseResponse<GoodsReceiptsResponse>> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts/${goodsReceiptsId}`;
  return BaseAxios.delete(link);
};

/**
 * xóa nhiều biên bản bàn giao
 */
export const deleteAllGoodsReceipService = (
  request: GoodsReceiptsDeleteRequest,
): Promise<GoodsReceiptsResponse> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts`;
  return BaseAxios.delete(link, { data: request });
};

/**
 * tìm kiếm bản bàn giao
 */
export const getGoodsReceiptsSerchService = (query: any): Promise<BaseResponse<any>> => {
  const queryString = generateQuery(query);
  return BaseAxios.get(`${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts?${queryString}`);
};
/**
 *  Danh sách đơn hàng đủ điều kiện thêm vào biên bản
 */
export const getOrderGoodsReceiptsService = (): Promise<BaseResponse<OrderResponse>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/goods-receipt-manager/orders?status=packed&last_created_hour=8`,
  );
};

/**
 * Tìm kiếm đơn hàng thỏa mãn biên bản bàn giao
 */
export const getOrderConcernGoodsReceiptsService = (
  param: GoodsReceiptsAddOrderRequest,
): Promise<BaseResponse<OrderConcernGoodsReceiptsResponse[]>> => {
  const queryString = generateQuery(param);
  return BaseAxios.get(`${ApiConfig.ORDER}/goods-receipt-manager/orders?${queryString}`);
};

/**
 * In biên bản bàn giao
 */

export const getPrintGoodsReceiptsService = (
  ids: number[],
  type: string,
): Promise<BaseResponse<any>> => {
  return BaseAxios.get(
    `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts/print_forms?ids=${ids}&type=${type}`,
  );
};

/**
 * xóa nhiều đơn hàng trong biên bản bàn giao
 */
export const deleteOrdergoodsReceipService = (
  order_ids: number[],
  goods_receipt_ids: number,
): Promise<GoodsReceiptsResponse> => {
  const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts-orders?order_ids=${order_ids}&goods_receipt_ids=${goods_receipt_ids}`;
  return BaseAxios.delete(link);
};

/**
 * Cập nhật ghi chú biên bản bàn giao
 */
// export const updateNoteGoodreceiptService=(id:number, note:string):Promise<GoodsReceiptsResponse>=>{
//   const link = `${ApiConfig.ORDER}/goods-receipt-manager/goods-receipts-note/${id}`;
//   return BaseAxios.put(link, {note:note})
// }
