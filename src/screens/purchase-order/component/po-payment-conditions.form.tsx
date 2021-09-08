import { Card, Col, Form, Input, Row, Select } from "antd";
import { POField } from "model/purchase-order/po-field";
import React from "react";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

type POPaymentConditionsFormProps = {
  listPayment: Array<PoPaymentConditions>;
  isEdit: Boolean;
};
const POPaymentConditionsForm: React.FC<POPaymentConditionsFormProps> = (
  props: POPaymentConditionsFormProps
) => {
  const { isEdit } = props;
  
  if(!isEdit) {
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
                  placeholder="Chọn điều khoản thanh toán"
                >
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
                <Input.TextArea maxLength={255} placeholder="Nhập diễn giải" />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
    );
  }
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
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.payment_condition_id] !== current[POField.payment_condition_id]
              }
            >
              {({ getFieldValue }) => {
                let store = getFieldValue(POField.payment_condition_name);
                return (
                  <div>
                    Điều khoản thanh toán: <strong>{store}</strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={24} md={10}>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev[POField.payment_note] !== current[POField.payment_note]
              }
            >
              {({ getFieldValue }) => {
                let store = getFieldValue(POField.payment_note);
                return (
                  <div>
                    Diễn giải: <strong>{store}</strong>
                  </div>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POPaymentConditionsForm;
