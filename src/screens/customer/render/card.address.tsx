import { PlusOutlined } from "@ant-design/icons";
import { Card, Col, Row, Form, Button, FormInstance } from "antd";
import { CustomerBillingAddress, CustomerBillingAddressClass, CustomerShippingAddressClass } from "model/request/customer.request";
import React from "react";

interface CardAddressProps {
    component: React.FunctionComponent<any>;
  title: string;
  countries: Array<any>,
  name: string;
  form?: FormInstance<any>;
  isEdit: boolean;
  reload?: () => void;
}

const RenderCardAdress = ({ component: Component, title, countries, name, form, isEdit, reload }: CardAddressProps) => {
  const handleClick = (callback: any) => {
      if (name.indexOf('bill') > -1) {
        let billAdd = new CustomerBillingAddressClass();
        callback(billAdd)
      } else {
        let shipAdd = new CustomerShippingAddressClass();
        callback(shipAdd)
      }
  }
  return (
    <Card
      title={
        <div className="d-flex">
          <span className="title-card">{title}</span>
        </div>
      }
    >
      <Row gutter={12} style={{ padding: "16px" }}>
        <Col span={24}>
          <Form.List name={name}>
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key} style={{ width: "100%" }}>
                    <Form.Item noStyle shouldUpdate={true}>
                      {() => (
                        <Component
                          index={index + 1}
                          countries={countries}
                          remove={remove}
                          field={field}
                          title={title.charAt(0) + title.slice(1, title.length).toLowerCase()}
                          name={name}
                          form={form}
                          isEdit={isEdit}
                          reload={reload}
                        />
                      )}
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="link"
                    size={"small"}
                    icon={<PlusOutlined />}
                    onClick={() => handleClick(add)}
                  >
                    Thêm địa chỉ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
    </Card>
  );
};

export default RenderCardAdress;
