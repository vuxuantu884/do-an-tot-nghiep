import { StoreCustomResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { storesDetailCustomApi } from "service/core/store.services";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetStoreDetail(storeId: number | undefined | null) {
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (storeId) {
      storesDetailCustomApi(storeId).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setStoreDetail(response.data);
        } else {
          handleFetchApiError(response, "Chi tiết cửa hàng", dispatch);
        }
      });
    }
  }, [dispatch, storeId]);

  return storeDetail;
}

export default useGetStoreDetail;
