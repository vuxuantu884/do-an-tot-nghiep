import { Card, Col, Form, Input, Row, Select } from "antd";
import { POField } from "model/purchase-order/po-field";
import React from "react";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

type POPaymentConditionsFormProps = {
  listPayment: Array<PoPaymentConditions>;
};
const POPaymentConditionsForm: React.FC<POPaymentConditionsFormProps> = (
  props: POPaymentConditionsFormProps
) => {
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">THANH TOÁN</span>
        </div>
      }
    >
      <div className="padding-20">
        <Row gutter={50}>
          <Col span={24} md={10}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn điều khoản thanh toán",
                },
              ]}
              name={POField.payment_condition_id}
              label="Điều khoản thanh toán"
            >
              <Select
                showArrow
                showSearch
                placeholder="Chọn điều khoản thanh toán"
              >
                <Select.Option value="">
                  Chọn điều khoản thanh toán
                </Select.Option>
                {props.listPayment.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.note}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={10}>
            <Form.Item name={POField.payment_note} label="Diễn giải">
              <Input.TextArea placeholder="Nhập diễn giải" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POPaymentConditionsForm;
