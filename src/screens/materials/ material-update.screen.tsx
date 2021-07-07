import { Button, Card, Col, Form, FormInstance, Input, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import {
  detailMaterialAction,
  updateMaterialAction,
} from "domain/actions/product/material.action";
import {
  MaterialResponse,
  MaterialUpdateRequest,
} from "model/product/material.model";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";

type MaterialPamram = {
  id: string;
};

const UpdateMaterial: React.FC = () => {
  const { id } = useParams<MaterialPamram>();
  const [oldData, setData] = useState<MaterialResponse | null>(null);
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.MATERIALS);
  }, [history]);
  const onFinish = useCallback(
    (values: MaterialUpdateRequest) => {
      let idNumber = parseInt(id);
      dispatch(updateMaterialAction(idNumber, values, onSuccess));
    },
    [dispatch, id, onSuccess]
  );
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    let idNumber = parseInt(id);
    if (!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, setData));
    }
  }, [dispatch, id]);
  if (oldData == null) {
    return <Card>Không tìm thấy chất liệu</Card>;
  }
  return (
    <ContentContainer
      title="Sửa chất liệu"
      breadcrumb={[
        {
          name: "Tổng quản",
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
          name: "Sửa chất liệu",
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={oldData}
        layout="vertical"
      >
        <Card title="Thông tin cơ bản">
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    { required: true, message: "Vui lòng nhập tên chất liệu" },
                  ]}
                  label="Tên chất liệu"
                  name="name"
                >
                  <Input placeholder="Tên danh mục" />
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
                  name="component"
                  label="Thành phần"
                >
                  <Input placeholder="Thành phần" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item
                  rules={[
                    { required: true, message: "Vui lòng nhập mã chất liệu" },
                    {
                      pattern: new RegExp("^\\S*$"),
                      message: "Mã chất liệu không được chứa khoảng trắng",
                    },
                    {
                      pattern: new RegExp("^[A-Za-z0-9 ]+$"),
                      message: "Mã chất liệu không chứa ký tự đặc biệt"
                    },
                  ]}
                  name="code"
                  labelAlign="right"
                  label="Mã chất liệu"
                >
                  <Input
                    placeholder="Mã chất liệu"
                    size="large"
                    maxLength={5}
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Form.Item name="description" label="Ghi chú">
                  <Input placeholder="Mã chất liệu" size="large" />
                </Form.Item>
                <Form.Item hidden name="version" label="Ghi chú">
                  <Input placeholder="Mã chất liệu" size="large" />
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
    </ContentContainer>
  );
};

export default UpdateMaterial;
