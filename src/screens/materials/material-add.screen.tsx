import { Button, Card, Col, Form, FormInstance, Input, Row, Space } from "antd";
import UrlConfig from "config/UrlConfig";
import { createMaterialAction } from "domain/actions/product/material.action";
import { CreateMaterialRequest } from "model/request/create-material.request";
import { createRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";

let initialRequest: CreateMaterialRequest = {
  code: "",
  component: "",
  description: "",
  name: "",
};

const AddMaterial: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.MATERIALS);
  }, [history]);
  const onFinish = useCallback(
    (values: CreateMaterialRequest) => {
      dispatch(createMaterialAction(values, onSuccess));
    },
    [dispatch, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  return (
    <Form
      ref={formRef}
      onFinish={onFinish}
      initialValues={initialRequest}
      layout="vertical"
    >
      <Card title="Thông tin cơ bản">
        <div className="padding-20">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chất liệu" },
                ]}
                label="Tên chất liệu"
                name="name"
              >
                <Input
                  className="r-5"
                  placeholder="Tên danh mục"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thành phần chất liệu",
                  },
                ]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Thành phần" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  { required: true, message: "Vui lòng nhập mã chất liệu" },
                ]}
                className="form-group form-group-with-search"
                name="code"
                labelAlign="right"
                label="Mã chất liệu"
              >
                <Input
                  className="r-5"
                  placeholder="Mã chất liệu"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="description"
                label="Ghi chú"
              >
                <Input
                  className="r-5"
                  placeholder="Mã chất liệu"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Card>
      <div className="margin-top-10" style={{ textAlign: "right" }}>
        <Space size={12}>
          <Button type="default" onClick={onCancel}>
            Hủy
          </Button>
          <Button htmlType="submit" type="primary">
            Lưu
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default AddMaterial;
