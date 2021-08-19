import { PlusOutlined } from "@ant-design/icons"
import { Card, Col, Row, Form, Button, FormInstance } from "antd"
import { CustomerContactClass } from "model/request/customer.request"
import React from "react"

interface CardContactProps {
    component: React.FunctionComponent<any>;
    title: string;
    name: string;
    form?: FormInstance<any>;
    isEdit: boolean;
    reload?: () => void;
}

const RenderCardContact = ({component: Component, title, name, form, isEdit, reload}: CardContactProps) => {
    return (
        <Card
        style={{marginTop: 16}}
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
                            remove={remove}
                            field={field}
                            form={form}
                            isEdit={isEdit}
                            reload={reload}
                            title={title}
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
                      onClick={() => add(new CustomerContactClass())}
                    >
                      Thêm {title.toLowerCase()}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Col>
        </Row>
      </Card>
    )
}

export default RenderCardContact