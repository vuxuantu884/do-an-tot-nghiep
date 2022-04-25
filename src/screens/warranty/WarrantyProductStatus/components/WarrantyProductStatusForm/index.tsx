import { Form, FormInstance, Input, Select, Switch } from "antd";
import CustomSelect from "component/custom/select.custom";
import { CreateWarrantyProductStatusFormModel } from "model/warranty/warranty.model";
import React from "react";
import { WARRANTY_PRODUCT_STATUS_TYPE } from "utils/Warranty.constants";

type PropTypes = {
  initialFormValues: CreateWarrantyProductStatusFormModel;
  form: FormInstance<any>;
};

function WarrantyProductStatusForm(props: PropTypes) {
  const { initialFormValues, form } = props;

  return (
    <Form form={form} layout="horizontal" initialValues={initialFormValues}>
      <Form.Item
        label={"Tên trạng thái"}
        labelCol={{ span: 8 }}
        labelAlign={"left"}
        name="name"
        rules={[
          {
            required: true,
            message: "Vui lòng điền tên trạng thái",
          },
        ]}>
        <Input placeholder="Nhập tên trạng thái" />
      </Form.Item>
      <Form.Item
        label={"Loại"}
        labelCol={{ span: 8 }}
        labelAlign={"left"}
        name="type"
        rules={[
          {
            required: true,
            message: "Vui lòng chọn loại trạng thái",
          },
        ]}>
        <CustomSelect
          allowClear
          showSearch
          placeholder="Chọn loại trạng thái"
          optionFilterProp="children">
          {WARRANTY_PRODUCT_STATUS_TYPE?.map((item) => (
            <Select.Option key={item.code} value={item.code}>
              {item.name}
            </Select.Option>
          ))}
        </CustomSelect>
      </Form.Item>
      <Form.Item
        label={"Trạng thái hoạt động"}
        labelCol={{ span: 8 }}
        labelAlign={"left"}
        name="status"
        valuePropName="checked">
        <Switch
        // defaultChecked={false}
        // onChange={(value) => {
        //   console.log("value", value);
        // }}
        />
      </Form.Item>
    </Form>
  );
}

export default WarrantyProductStatusForm;
