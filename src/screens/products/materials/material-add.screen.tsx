import { Button, Card, Col, Form, FormInstance, Input, Row, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { createMaterialAction } from "domain/actions/product/material.action";
import { MaterialCreateRequest } from "model/product/material.model";
import { createRef, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";

let initialRequest: MaterialCreateRequest = {
  code: "",
  component: "",
  description: "",
  name: "",
  advantages: "",
  defect: "",
  preserve: "",
};

const AddMaterial: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [loading, setLoading] = useState<boolean>(false);
  const onSuccess = useCallback(() => {
    setLoading(false);
    history.push(UrlConfig.MATERIALS);
  }, [history]);
  const onFinish = useCallback(
    (values: MaterialCreateRequest) => {
      const newValue = {
        ...values,
        code: values.code.trim(),
        component: values.component.trim(),
        description: values.description.trim(),
        name: values.name.trim(),
        advantages: values.advantages.trim(),
        defect: values.defect.trim(),
        preserve: values.preserve.trim(),
      };
      setLoading(true);
      dispatch(createMaterialAction(newValue, onSuccess));
    },
    [dispatch, onSuccess]
  ); 
  
  return (
    <ContentContainer
      title="Thêm chất liệu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Chất liệu",
          path: `${UrlConfig.MATERIALS}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={initialRequest}
        layout="vertical"
      >
        <Card title="Thông tin cơ bản">
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    whitespace: true,
                    required: true,
                    message: "Vui lòng nhập mã chất liệu",
                  },
                ]}
                name="code"
                label="Mã chất liệu:"
              >
                <Input placeholder="Nhập mã chất liệu" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    whitespace: true,
                    required: true,
                    message: "Vui lòng nhập mã chất liệu",
                  },
                  {
                    max: 50,
                    message: "Tên chất liệu không vượt quá 50 ký tự",
                  },
                ]}
                label="Tên chất liệu:"
                name="name"
              >
                <Input maxLength={50} placeholder="Tên chất liệu" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="component"
                label="Thành phần:"
                rules={[{ max: 255, message: "Thành phần không quá 255 kí tự" }]}
              >
                <Input maxLength={255} placeholder="Nhập thành phần" />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item 
                name="preserve"
                label="Thông tin bảo quản:"
              >
                <Input placeholder="Thông tin bảo quản" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="advantages"
                label="Ưu điểm:"
              >
                <Input.TextArea
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  placeholder="Ưu điểm"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="defect"
                label="Nhược điểm:"
              >
                <Input.TextArea
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  placeholder="Nhược điểm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={16}>
              <Form.Item
                rules={[{ max: 255, message: "Ghi chú không quá 255 kí tự" }]}
                name="description"
                label="Ghi chú:"
              >
                <Input.TextArea
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  maxLength={255}
                  placeholder="Nhập ghi chú"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card> 
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space>
              <Button loading={loading} htmlType="submit" type="primary">
                Tạo chất liệu
              </Button>
            </Space>
          }
        />
      </Form> 
    </ContentContainer>
  );
};

export default AddMaterial;
