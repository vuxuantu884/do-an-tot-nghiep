import { PageResponse } from "./../../../model/base/base-metadata.response";
import BaseAction from "base/base.action";
import { GoodsReceiptsType } from "domain/types/goods-receipts";
import { GoodsReceiptsDeleteRequest, GoodsReceiptsRequest } from "model/request/pack.request";
import {
  GoodsReceiptsTypeResponse,
  GoodsReceiptsResponse,
  OrderConcernGoodsReceiptsResponse,
} from "model/response/pack/pack.response";
import { OrderResponse } from "model/response/order/order.response";

export const getGoodsReceiptsType = (setData: (data: Array<GoodsReceiptsTypeResponse>) => void) => {
  return BaseAction(GoodsReceiptsType.GET_GOODS_RECEIPTS_TYPE, { setData });
};

export const createGoodsReceipts = (
  data: GoodsReceiptsRequest,
  setData: (data: GoodsReceiptsResponse) => void,
) => {
  return BaseAction(GoodsReceiptsType.CREATE_GOODS_RECEIPTS, { data, setData });
};

export const getGoodsReceiptsSearch = (
  data: any,
  setData: (data: PageResponse<GoodsReceiptsResponse>) => void,
) => {
  return BaseAction(GoodsReceiptsType.SEARCH_GOODS_RECEIPTS, { data, setData });
};

export const updateGoodsReceipts = (
  goodsReceiptsId: number,
  data: GoodsReceiptsRequest,
  setData: (data: GoodsReceiptsResponse) => void,
) => {
  return BaseAction(GoodsReceiptsType.UPDATE_GOODS_RECEIPTS, {
    goodsReceiptsId,
    data,
    setData,
  });
};

export const deleteGoodsReceipts = (goodsReceiptsId: number, setData: (data: boolean) => void) => {
  return BaseAction(GoodsReceiptsType.DELETE_GOODS_RECEIPTS, {
    goodsReceiptsId,
    setData,
  });
};

export const deleteAllGoodsReceipts = (
  request: GoodsReceiptsDeleteRequest,
  setData: (data: GoodsReceiptsResponse) => void,
) => {
  return BaseAction(GoodsReceiptsType.DELETE_ALL_GOODS_RECEIPTS, {
    request,
    setData,
  });
};

export const getByIdGoodsReceipts = (
  goodsReceiptsId: number,
  setData: (data: GoodsReceiptsResponse) => void,
) => {
  return BaseAction(GoodsReceiptsType.GETBYID_GOODS_RECEIPTS, {
    goodsReceiptsId,
    setData,
  });
};

export const getOrderConcernGoodsReceipts = (
  param: any,
  setData: (data: OrderConcernGoodsReceiptsResponse[]) => void,
) => {
  return BaseAction(GoodsReceiptsType.GET_ORDER_CONCERN_GOODS_RECEIPTS, {
    param,
    setData,
  });
};

export const getOrderGoodsReceipts = (setData: (data: OrderResponse[]) => void) => {
  return BaseAction(GoodsReceiptsType.GET_ORDER_GOODS_RECEIPTS_ADD, {
    setData,
  });
};

export const getPrintGoodsReceipts = (
  ids: number[],
  type: string,
  setData: (data: any) => void,
) => {
  return BaseAction(GoodsReceiptsType.GET_PRINT_GOODS_RECEIPTS, {
    ids,
    type,
    setData,
  });
};

/**
 * xóa nhiều đơn hàng trong biên bản bàn giao
 */
export const deleteOrdergoodsReceips = (
  order_ids: number[],
  goods_receipt_ids: number,
  onSuccess: (data?: boolean) => void,
) => {
  return BaseAction(GoodsReceiptsType.DELETE_ORDER_GOODS_RECEIPTS, {
    order_ids,
    goods_receipt_ids,
    onSuccess,
  });
};

/**
 * Cập nhật ghi chú biên bản bàn giao
 */
// export const updateNoteGoodreceipt = (id: number, note: string, onSuccess: (data?: boolean) => void) => {
//     return BaseAction(GoodsReceiptsType.UPDATE_NOTE_GOODS_RECEIPT, { id, note, onSuccess })
// }
