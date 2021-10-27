import { StoreResponse } from "model/core/store.model";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { createContext } from "react";

type OrderPackContextType = {
  listThirdPartyLogistics: DeliveryServiceResponse[];
  setListThirdPartyLogistics: (value: DeliveryServiceResponse[]) => void;
  listStores:Array<StoreResponse>;
  setListStores:(value: Array<StoreResponse>)=>void;
  listGoodsReceipts:Array<GoodsReceiptsTypeResponse>;
  setListGoodsReceipts:(value: Array<GoodsReceiptsTypeResponse>)=>void;
};
// tạo context
export const OrderPackContext = createContext<OrderPackContextType>({
    listThirdPartyLogistics:[],
    setListThirdPartyLogistics:(value: DeliveryServiceResponse[]) =>{},
    listStores:[],
    setListStores:(value: StoreResponse[]) =>{},
    listGoodsReceipts:[],
    setListGoodsReceipts:(value: GoodsReceiptsTypeResponse[]) =>{},
});
