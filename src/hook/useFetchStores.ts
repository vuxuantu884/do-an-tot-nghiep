import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getStorePublicService } from "service/core/store.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useFetchStores() {
	const [stores, setStores] = useState<Array<StoreResponse>>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		getStorePublicService().then(response => {
			console.log('response', response)
			if (isFetchApiSuccessful(response)) {
				setStores(response.data);
			} else {
				handleFetchApiError(response, "Danh sách cửa hàng", dispatch)
			}
		})
	}, [dispatch]);

  return stores;
}

export default useFetchStores;
