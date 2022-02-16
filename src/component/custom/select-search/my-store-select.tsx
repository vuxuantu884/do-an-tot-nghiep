import { Select, SelectProps } from "antd";
import { AccountStoreResponse } from "model/account/account.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { ReactElement } from "react";
import { useSelector } from "react-redux";

interface Props extends SelectProps<number> {}
const defaultSelectProps = {
  showSearch: true,
  allowClear: true,
  placeholder: "Chọn cửa hàng",
};
MyStoreSelect.defaultProps = {};
function MyStoreSelect(props: Props): ReactElement {
  const myStores :any= useSelector((state: RootReducerType) => state.userReducer.account?.account_stores);
  return (
    <Select
      {...defaultSelectProps}
      optionFilterProp="title"
      {...props}>
      {myStores?.map((store: AccountStoreResponse) =>
        store?.store_id ? (
          <Select.Option value={store.store_id} key={"store_id" + store.store_id}>
            {store.store}
          </Select.Option>
        ) : null
      )}
    </Select>
  );
}

export default MyStoreSelect;
