import React from "react";
import { Form, Input, Select } from "antd";
import NumberInput from "../custom/number-input.custom";

type SupplierInputOptionProps = {
  list?: any[];
  placeholder?: string;
  label: string;
  inputName: string;
  selectName: string;
};

const { Item } = Form;
const { Option } = Select;
const SupplierInputOption = ({
  list = [],
  label,
  placeholder,
  inputName,
  selectName,
}: SupplierInputOptionProps) => {
  return (
    <>
      <Item label={label} rules={[{required: true}]}>
        <Input.Group className="ip-group" compact>
          <Item name={inputName} noStyle>
            <NumberInput isFloat style={{ width: "70%" }} placeholder={placeholder} />
          </Item>
          <Item name={selectName} noStyle>
            <Select className="selector-group" defaultActiveFirstOption style={{ width: "30%" }}>
              {list.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
        </Input.Group>
      </Item>
    </>
  );
};

export default SupplierInputOption;
