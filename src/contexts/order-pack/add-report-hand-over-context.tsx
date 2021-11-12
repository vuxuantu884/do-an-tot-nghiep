import { StoreResponse } from "model/core/store.model";
import { OrderResponse } from "model/response/order/order.response";
import { createContext } from "react";

type AddReportHandOverContextType={
    listStores:Array<StoreResponse>;
    setListStores:(value: Array<StoreResponse>)=>void;
    orderListResponse:Array<OrderResponse>;
    setOrderListResponse:(item:Array<OrderResponse>)=>void;
}

export const AddReportHandOverContext=createContext<AddReportHandOverContextType>({
    listStores:[],
    setListStores:(value: StoreResponse[]) =>{},
    orderListResponse:[],
    setOrderListResponse:(item:Array<OrderResponse>)=>{},
})