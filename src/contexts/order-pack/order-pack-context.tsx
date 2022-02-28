import { StoreResponse } from "model/core/store.model";
import { ChannelsResponse, DeliveryServiceResponse, OrderResponse } from "model/response/order/order.response";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { createContext } from "react";

type OrderPackContextType = {
  listThirdPartyLogistics: DeliveryServiceResponse[];
  setListThirdPartyLogistics: (value: DeliveryServiceResponse[]) => void;
  listStores:Array<StoreResponse>;
  setListStores:(value: Array<StoreResponse>)=>void;
  listGoodsReceiptsType:Array<GoodsReceiptsTypeResponse>;
  setListGoodsReceiptsType:(value: Array<GoodsReceiptsTypeResponse>)=>void;
  listChannels:Array<ChannelsResponse>;
  setListChannels:(value: Array<ChannelsResponse>)=>void;
  data:OrderResponse[];
  setData:(value:OrderResponse[])=>void;
  setIsFulFillmentPack:(fulFillmentCode:string[])=>void;
  isFulFillmentPack:string[];
};
// tạo context
export const OrderPackContext = createContext<OrderPackContextType>({
    listThirdPartyLogistics:[],
    setListThirdPartyLogistics:(value: DeliveryServiceResponse[]) =>{},
    listStores:[],
    setListStores:(value: StoreResponse[]) =>{},
    listGoodsReceiptsType:[],
    setListGoodsReceiptsType:(value: GoodsReceiptsTypeResponse[]) =>{},
    listChannels:[],
    setListChannels:(value: ChannelsResponse[]) =>{},
    data:[],
    setData:(value:OrderResponse[])=>{},
    setIsFulFillmentPack:(fulFillmentCode:string[])=>{},
    isFulFillmentPack:[]
});
