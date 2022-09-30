import { StoreResponse } from "model/core/store.model";
import { FulFillmentResponse, OrderResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { getFulfillmentActive } from "utils/OrderUtils";

type PropTypes = {
  currentStores: StoreResponse[];
  OrderDetail: OrderResponse | null;
  fulfillments: FulFillmentResponse[] | null | undefined;
};

function useGetDefaultReturnOrderReceivedStore(props: PropTypes) {
  const { currentStores, OrderDetail, fulfillments } = props;
  const [defaultReceiveReturnStore, setDefaultReceiveReturnStore] = useState<
    StoreResponse | undefined
  >();

  useEffect(() => {
    const getStoreIdFromReturnOriginOrderActiveFulfillment = () => {
      let result = undefined;
      const activeFulfillment = getFulfillmentActive(fulfillments);
      if (activeFulfillment) {
        const ReturnOriginOrderReturnStoreId = activeFulfillment.returned_store_id;
        if (ReturnOriginOrderReturnStoreId) {
          result = currentStores?.find((single) => single.id === ReturnOriginOrderReturnStoreId);
        }
      }
      console.log("result5555", result);
      console.log("activeFulfillment", activeFulfillment);
      console.log("fulfillments", fulfillments);
      return result;
    };
    const getDefault = () => {
      let result = undefined;
      if (currentStores?.length === 1) {
        return currentStores[0];
      }
      result = getStoreIdFromReturnOriginOrderActiveFulfillment();
      if (!result) {
        result = currentStores?.find((single) => single.id === OrderDetail?.store_id);
      }
      console.log("result333", result);
      return result;
    };
    setDefaultReceiveReturnStore(getDefault());
  }, [OrderDetail?.store_id, currentStores, fulfillments]);

  return defaultReceiveReturnStore;
}

export default useGetDefaultReturnOrderReceivedStore;
