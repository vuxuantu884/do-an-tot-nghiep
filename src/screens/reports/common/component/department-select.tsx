import { FormInstance, Select, SelectProps } from "antd";
import { AccountStoreResponse } from "model/account/account.model";
import { ReactElement } from "react";
import { strForSearch } from "utils/StringUtils";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";

const { Option } = Select;
interface Props extends SelectProps<number> {
  form: FormInstance;
  assignedStore: AccountStoreResponse[];
}

DepartmentSelect.defaultProps = {};
function DepartmentSelect(props: Props): ReactElement {
  const { form, assignedStore } = props;

  const handleOnChange = (store: string) => {
    form.setFieldsValue({
      [InventoryBalanceFilterForm.Inventory]: JSON.parse(store).store,
    });
  };

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
          {item.store}
        </Option>
      ))}
    </Select>
  );
}

export default DepartmentSelect;
