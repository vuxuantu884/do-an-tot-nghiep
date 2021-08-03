import { PlusOutlined } from "@ant-design/icons"
import { Card, Col, Row, Form, Button } from "antd"
import React from "react"

interface CardContactProps {
    component: React.FunctionComponent<any>;
    title: string;
    name: string;
}

const RenderCardContact = ({component: Component, title, name}: CardContactProps) => {
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
                      onClick={() => add()}
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