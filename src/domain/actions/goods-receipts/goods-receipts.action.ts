import BaseAction from "base/base.action";
import { GoodsReceiptsType } from "domain/types/goods-receipts";
import { GoodsReceiptsRequest } from "model/request/pack.request";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";

export const getGoodsReceiptsType = (setData: (data: Array<GoodsReceiptsTypeResponse>) => void) => {
    return BaseAction(GoodsReceiptsType.GET_GOODS_RECEIPTS_TYPE, { setData });
};

export const createGoodsReceipts = (data:GoodsReceiptsRequest,setData: (data: GoodsReceiptsTypeResponse) => void) => {
    return BaseAction(GoodsReceiptsType.CREATE_GOODS_RECEIPTS, {data, setData });
};

export const getGoodsReceiptsSerch = (data:any,setData: (data: Array<any>) => void) => {
    return BaseAction(GoodsReceiptsType.SEARCH_GOODS_RECEIPTS, { setData });
};