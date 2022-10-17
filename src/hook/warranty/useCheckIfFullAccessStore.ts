import { RootReducerType } from "model/reducers/RootReducerType";
import { useSelector } from "react-redux";

function useCheckIfFullAccessStore() {
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const isFullAccessStore = userReducer.account?.account_stores.length === 0;

  return isFullAccessStore;
}
export default useCheckIfFullAccessStore;
