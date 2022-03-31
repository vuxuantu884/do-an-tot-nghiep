import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchStores() {
	const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
	const dispatch = useDispatch();

  useEffect(() => {
		dispatch(StoreGetListAction(setListStores));
	}, [dispatch]);

  return listStores;
}

export default useFetchStores;
