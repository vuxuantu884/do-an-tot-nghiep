import { StoreResponse } from "model/core/store.model";
import { OrderWithFulfillmentActiveModel } from "model/order/order.model";
import { PackModel } from "model/pack/pack.model";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import { GoodsReceiptsTypeResponse } from "model/response/pack/pack.response";
import { createContext } from "react";

type OrderPackContextType = {
  listThirdPartyLogistics: DeliveryServiceResponse[];
  setListThirdPartyLogistics: (value: DeliveryServiceResponse[]) => void;
  listStores: Array<StoreResponse>;
  setListStores: (value: Array<StoreResponse>) => void;
  listStoresDataCanAccess?: Array<StoreResponse>;
  setListStoresDataCanAccess?: (value: Array<StoreResponse>) => void;
  listGoodsReceiptsType: Array<GoodsReceiptsTypeResponse>;
  setListGoodsReceiptsType: (value: Array<GoodsReceiptsTypeResponse>) => void;
  listChannels: Array<ChannelsResponse>;
  setListChannels: (value: Array<ChannelsResponse>) => void;
  singlePack: PackModel | null | undefined;
  setSinglePack: (value: PackModel) => void;
  setIsFulFillmentPack: (fulFillmentCode: string[]) => void;
  isFulFillmentPack: string[];
  setLoading?: (value: boolean) => void;
  loading?: boolean;
};
// tạo context
export const OrderPackContext = createContext<OrderPackContextType>({
  listThirdPartyLogistics: [],
  setListThirdPartyLogistics: (value: DeliveryServiceResponse[]) => {},
  listStores: [],
  setListStores: (value: StoreResponse[]) => {},
  listStoresDataCanAccess: [],
  setListStoresDataCanAccess: (value: StoreResponse[]) => {},
  listGoodsReceiptsType: [],
  setListGoodsReceiptsType: (value: GoodsReceiptsTypeResponse[]) => {},
  listChannels: [],
  setListChannels: (value: ChannelsResponse[]) => {},
  singlePack: null,
  setSinglePack: (value: PackModel) => {},
  setIsFulFillmentPack: (fulFillmentCode: string[]) => {},
  isFulFillmentPack: [],
  setLoading: (value: boolean) => {},
  loading: false,
});
