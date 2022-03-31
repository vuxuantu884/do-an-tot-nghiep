import { useMemo } from "react";

function useGetStoreIdFromLocalStorage() {
	const storeIdLogin = useMemo(() => {
    let storeLoginString = localStorage.getItem("store_default");
    let storeId = storeLoginString ? JSON.parse(storeLoginString)?.id ? JSON.parse(storeLoginString)?.id : undefined : undefined;
    return storeId;
  }, [])

  return storeIdLogin;
}

export default useGetStoreIdFromLocalStorage;
