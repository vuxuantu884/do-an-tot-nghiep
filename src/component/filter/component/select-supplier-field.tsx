import { Select } from "antd";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { SupplierResponse } from "model/core/supplier.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type SupplierSelectProps = {
  isMulti?: boolean;
  hasSelectAll?: boolean;
  allowClear?: boolean;
};

SelectSupplierField.defaultProps = {
  isMulti: false,
  hasSelectAll: false,
  allowClear: false,
};

function SelectSupplierField(props: SupplierSelectProps) {
  const { isMulti, hasSelectAll, ...restProps } = props;
  const dispatch = useDispatch();
  const [allSupplier, setAllSupplier] = useState<Array<SupplierResponse>>();
  useEffect(() => {
    dispatch(
      SupplierGetAllAction((suppliers) => {
        if(suppliers)
        setAllSupplier(suppliers);
      })
    );
  }, [dispatch]);
  return (
    <Select
      showSearch
      optionFilterProp="children"
      showArrow
      placeholder="Chọn nhà cung cấp"
      mode={isMulti ? "multiple" : undefined}
      style={{
        width: "100%",
        minWidth: 200
      }}
      maxTagCount="responsive"
      {...restProps}
    >
      {allSupplier?.map((item) => (
        <Select.Option key={item.id} value={item.id}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectSupplierField;
