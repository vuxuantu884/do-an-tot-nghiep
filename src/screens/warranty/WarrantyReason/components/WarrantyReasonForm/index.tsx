import { Col, Form, FormInstance, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { FormValueCreateReasonType } from "model/warranty/warranty.model";
import React from "react";
import { formatCurrency, formatCurrencyInputValue, replaceFormatString } from "utils/AppUtils";
import { WARRANTY_REASON_STATUS } from "utils/Warranty.constants";

type PropTypes = {
  initialFormValues: FormValueCreateReasonType;
  form: FormInstance<any>;
};

function WarrantyReasonForm(props: PropTypes) {
  const { initialFormValues, form } = props;

  return (
    <Form form={form} layout="horizontal" initialValues={initialFormValues}>
      <Row gutter={30}>
        <Col span={12}>
          <Form.Item
            label={"Tên lý do"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập lý do",
              },
            ]}>
            <Input placeholder="Nhập tên lý do" />
          </Form.Item>
          <Form.Item
            label={"Trạng thái hoạt động"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="status"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái hoạt động",
              },
            ]}>
            <CustomSelect showSearch placeholder="Chọn trạng thái" optionFilterProp="children">
              {WARRANTY_REASON_STATUS?.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </CustomSelect>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={"Phí thực tế"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="price"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập phí thực tế",
              },
            ]}>
            <NumberInput
              format={(a: string) => {
                return formatCurrencyInputValue(a)
              }}
              replace={(a: string) => replaceFormatString(a)}
              placeholder="Nhập phí sửa chữa"
              maxLength={14}
              minLength={0}
              style={{
                textAlign: "left",
              }}
            />
          </Form.Item>
          <Form.Item
            label={"Phí báo khách"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="customer_fee"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập phí báo khách",
              },
            ]}>
            <NumberInput
              format={(a: string) => {
                if(a) {
                  return formatCurrency(a)
                } else {
                  return ""
                }
              }}
              replace={(a: string) => replaceFormatString(a)}
              placeholder="Nhập phí sửa chữa"
              maxLength={14}
              minLength={0}
              style={{
                textAlign: "left",
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default WarrantyReasonForm;
