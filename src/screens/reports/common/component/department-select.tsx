import { FormInstance, Select, SelectProps } from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { strForSearch } from "utils/StringUtils";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";

const { Option } = Select;
interface Props extends SelectProps<number> {
  form: FormInstance;
}

DepartmentSelect.defaultProps = {};
function DepartmentSelect(props: Props): ReactElement {
  const { form } = props;
  const dispatch = useDispatch();
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const myStores: AccountStoreResponse[] | undefined = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const handleOnChange = (store: string) => {
    form.setFieldsValue({
      [InventoryBalanceFilterForm.Inventory]: JSON.parse(store).name,
    });
  };

  const assignedStore: StoreResponse[] = useMemo(() => {
    if (Array.isArray(myStores) && myStores.length === 0) {
      return listStore;
    }

    let stores: StoreResponse[] = [];
    myStores?.forEach((store: AccountStoreResponse) => {
      const s = listStore.find((item) => item.id === store.store_id);
      if (s) {
        stores.push(s);
      }
    });

    return stores;
  }, [listStore, myStores]);

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);
  return (
    <Select
      placeholder="Kho/cửa hàng"
      showArrow
      showSearch
      optionFilterProp="children"
      style={{ width: "200px" }}
      maxTagCount={"responsive"}
      filterOption={(input: String, option: any) => {
        if (option.props.value) {
          return strForSearch(option.props.children).includes(strForSearch(input));
        }
        return false;
      }}
      onChange={handleOnChange}
    >
      {assignedStore.map((item, index) => (
        <Option key={"store_id" + index} value={JSON.stringify(item)}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
}

export default DepartmentSelect;
