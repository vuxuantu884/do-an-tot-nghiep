import { Form, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { AppConfig } from "config/app.config";
import { StoreResponse } from "model/core/store.model";
import { useEffect } from "react";
import { strForSearch } from "utils/StringUtils";
const { Option } = Select;

interface IProps {
  stores: StoreResponse[];
  form: FormInstance;
}

export const POStore = (props: IProps) => {
  const { stores, form } = props;
  useEffect(() => {
    form.setFieldsValue({
      store_id: "144", //default id tổng
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form.Item
      name="store_id"
      className="select-item"
      rules={[
        {
          required: true,
        },
      ]}
      help={false}
    >
      <Select
        style={{ minWidth: "205px" }}
        placeholder="Kho nhận"
        showArrow
        showSearch
        maxTagCount={"responsive" as const}
        optionFilterProp="children"
        allowClear
        defaultValue={AppConfig.PO_STORE_DEFAULT} //id Kho tổng
        filterOption={(input: String, option: any) => {
          if (option.props.value) {
            return strForSearch(option.props.children).includes(
              strForSearch(input),
            );
          }

          return false;
        }}
      >
        {Array.isArray(stores) &&
          stores.length > 0 &&
          stores.map((item, index) => {
            return (
              <Option key={"store_id" + index} value={item.id.toString()}>
                {item.name}
              </Option>
            );
          })}
      </Select>
    </Form.Item>
  );
};
