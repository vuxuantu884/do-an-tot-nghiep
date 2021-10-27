import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { SourceEcommerceResponse } from "model/response/order/source.response";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { createContext } from "react";

type OrderPackContextType = {
  listThirdPartyLogistics: DeliveryServiceResponse[];
  setListThirdPartyLogistics: (value: DeliveryServiceResponse[]) => void;
  listStores:Array<StoreResponse>;
  setListStores:(value: Array<StoreResponse>)=>void;
  listGoodsReceipts:Array<GoodsReceiptsTypeResponse>;
  setListGoodsReceipts:(value: Array<GoodsReceiptsTypeResponse>)=>void;
  listSourcesEcommerce:Array<SourceEcommerceResponse>;
  setListSourcesEcommerce:(value: Array<SourceEcommerceResponse>)=>void;
  data:PageResponse<any>;
};
// tạo context
export const OrderPackContext = createContext<OrderPackContextType>({
    listThirdPartyLogistics:[],
    setListThirdPartyLogistics:(value: DeliveryServiceResponse[]) =>{},
    listStores:[],
    setListStores:(value: StoreResponse[]) =>{},
    listGoodsReceipts:[],
    setListGoodsReceipts:(value: GoodsReceiptsTypeResponse[]) =>{},
    listSourcesEcommerce:[],
    setListSourcesEcommerce:(value: SourceEcommerceResponse[]) =>{},
    data:{
      metadata: {
        limit: 1,
        page: 1,
        total: 0,
      },
      items: [],
    }
});
