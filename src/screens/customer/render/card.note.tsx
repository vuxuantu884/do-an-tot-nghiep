import { PlusOutlined } from "@ant-design/icons"
import { Card, Col, Row, Form, Button } from "antd"
import { CustomerNoteClass } from "model/request/customer.request"
import React from "react"

interface CardNoteProps {
    component: React.FunctionComponent<any>;
    title: string;
    name: string;
}

const RenderCardNote = ({component: Component, title, name}: CardNoteProps) => {
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
                            remove={remove}
                            field={field}
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
                      onClick={() => add(new CustomerNoteClass())}
                    >
                      Thêm ghi chú
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

export default RenderCardNote