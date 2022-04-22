import { SelectProps } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { DashboardContext } from "../provider/dashboard-provider";
interface Props extends SelectProps<number> { }

DepartmentSelect.defaultProps = {};
function DepartmentSelect(props: Props): ReactElement {
  const dispatch = useDispatch();
  const {setDeparmentIdList} = useContext(DashboardContext);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const myStore: AccountStoreResponse[] | undefined = useSelector((state: RootReducerType) => state.userReducer.account?.account_stores);

  const handleOnChange = (values: number[], labelList: any[] ) => {
    setDeparmentIdList(values);
  };

  const assignedStore: StoreResponse[] = useMemo(() => {
    if (Array.isArray(myStore) && myStore.length === 0) {
      return listStore;
    }

    let stores: StoreResponse[] = [];
    myStore?.forEach((store: AccountStoreResponse) => {
      const s = listStore.find(item => item.id === store.store_id);
      if (s) {
        stores.push(s);
      }
    });

    return stores;
  }, [listStore, myStore]);


  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);
  return (
    <TreeStore listStore={assignedStore} name="" style={{ width: "250px" }} onChange={handleOnChange} placeholder={"Chọn bộ phận"}/>
  );
}

export default DepartmentSelect;
