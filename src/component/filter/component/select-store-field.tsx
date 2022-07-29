import { Select } from "antd";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type StoreSelectProps = {
  //   name: string;
  isMulti?: boolean;
  hasSelectAll?: boolean;
  allowClear?: boolean;
};

SelectStoreField.defaultProps = {
  isMulti: false,
  hasSelectAll: false,
  allowClear: false,
};

function SelectStoreField(props: StoreSelectProps) {
  const { isMulti, hasSelectAll, ...restProps } = props;
  const dispatch = useDispatch();
  const [allStore, setAllStore] = useState<Array<StoreResponse>>();
  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setAllStore(stores);
      }),
    );
  }, [dispatch]);
  return (
    <Select
      showSearch
      optionFilterProp="children"
      showArrow
      placeholder="Chọn cửa hàng"
      mode={isMulti ? "multiple" : undefined}
      style={{
        width: "100%",
      }}
      maxTagCount="responsive"
      {...restProps}
    >
      {allStore?.map((item) => (
        <Select.Option key={item.id} value={item.id}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectStoreField;
