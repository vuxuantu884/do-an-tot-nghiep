import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getStorePublicService } from "service/core/store.service";
import { handleFetchApiError, haveAccess, isFetchApiSuccessful } from "utils/AppUtils";

function useFetchStores() {
	const [stores, setStores] = useState<Array<StoreResponse>>([]);
	const dispatch = useDispatch();
	const userReducer = useSelector((state: RootReducerType) => state.userReducer);

	const dataCanAccess = useMemo(() => {
		let newData: Array<StoreResponse> = [];
		if (stores && stores.length) {
			if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
				newData = stores.filter((store) =>
					haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : [])
				);
			} else {
				newData = stores;
			}
		}
		return newData;
	}, [stores, userReducer.account]);

	useEffect(() => {
		getStorePublicService().then(response => {
			if (isFetchApiSuccessful(response)) {
				setStores(response.data);
			} else {
				handleFetchApiError(response, "Danh sách cửa hàng", dispatch)
			}
		})
	}, [dispatch]);

	return dataCanAccess;
}

export default useFetchStores;
