import { PageResponse } from './../../../model/base/base-metadata.response';
import BaseAction from "base/base.action";
import { GoodsReceiptsType } from "domain/types/goods-receipts";
import { GoodsReceiptsRequest } from "model/request/pack.request";
import { GoodsReceiptsTypeResponse,GoodsReceiptsResponse } from "model/response/pack/pack.response";

export const getGoodsReceiptsType = (setData: (data: Array<GoodsReceiptsTypeResponse>) => void) => {
    return BaseAction(GoodsReceiptsType.GET_GOODS_RECEIPTS_TYPE, { setData });
};

export const createGoodsReceipts = (data:GoodsReceiptsRequest,setData: (data: GoodsReceiptsResponse) => void) => {
    return BaseAction(GoodsReceiptsType.CREATE_GOODS_RECEIPTS, {data, setData });
};

export const getGoodsReceiptsSerch = (data:any,setData: (data:PageResponse<GoodsReceiptsResponse>) => void) => {
    return BaseAction(GoodsReceiptsType.SEARCH_GOODS_RECEIPTS, {data, setData });
};

export const updateGoodsReceipts=(goodsReceiptsId:number,data:GoodsReceiptsRequest, setData:(data:GoodsReceiptsResponse)=>void)=>{
    return BaseAction(GoodsReceiptsType.UPDATE_GOODS_RECEIPTS,{goodsReceiptsId,data,setData});
}

export const deleteGoodsReceipts=(goodsReceiptsId:number,setData:(data:GoodsReceiptsResponse)=>void)=>{
    return BaseAction(GoodsReceiptsType.DELETE_GOODS_RECEIPTS,{goodsReceiptsId,setData});
}

export const getByIdGoodsReceipts=(goodsReceiptsId:number,setData:(data:GoodsReceiptsTypeResponse)=>void)=>{
    return BaseAction(GoodsReceiptsType.GETBYID_GOODS_RECEIPTS,{goodsReceiptsId,setData})
}