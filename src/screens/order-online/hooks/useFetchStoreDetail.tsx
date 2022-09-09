import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreCustomResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchStoreDetail(storeId?: number) {
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (storeId) {
      dispatch(
        StoreDetailAction(storeId, (data) => {
          setStoreDetail(data);
        }),
      );
    }
  }, [dispatch, storeId]);

  return storeDetail;
}

export default useFetchStoreDetail;
