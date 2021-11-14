import { StoreResponse } from "model/core/store.model";
import { OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import { createContext } from "react";

type AddReportHandOverContextType={
    listStores:Array<StoreResponse>;
    setListStores:(value: Array<StoreResponse>)=>void;
    orderListResponse:Array<OrderConcernGoodsReceiptsResponse>;
    setOrderListResponse:(item:Array<OrderConcernGoodsReceiptsResponse>)=>void;
}

export const AddReportHandOverContext=createContext<AddReportHandOverContextType>({
    listStores:[],
    setListStores:(value: StoreResponse[]) =>{},
    orderListResponse:[],
    setOrderListResponse:(item:Array<OrderConcernGoodsReceiptsResponse>)=>{},
})