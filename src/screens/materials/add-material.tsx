import { Button, Card, Col, Form, FormInstance, Input, Row } from "antd";
import { createMaterialAction } from "domain/actions/material.action";
import { CreateMaterialRequest } from "model/request/create-material.request";
import { createRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";

let initialRequest: CreateMaterialRequest = {
  code: '',
  component: '',
  description: '',
  name: ''
}

const AddMaterial: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push('/products/materials');
  }, [history])
  const onFinish = useCallback((values: CreateMaterialRequest) => {
    dispatch(createMaterialAction(values, onSuccess));
  }, [dispatch, onSuccess]);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  return (
    <div>
      <Card className="card-block card-block-normal" title="Thông tin cơ bản">
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={initialRequest}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                className="form-group form-group-with-search"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên chất liệu' },
                ]}
                label="Tên chất liệu"
                name="name"
              >
                <Input className="r-5" placeholder="Tên danh mục" size="large" />
              </Form.Item>
            </Col>
            <Col offset={1} span={8}>
              <Form.Item
                rules={[{ required: true, message: 'Vui lòng nhập thành phần chất liệu' }]}
                className="form-group form-group-with-search"
                name="component"
                label="Thành phần"
              >
                <Input className="r-5" placeholder="Thành phần" size="large" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                rules={[
                  { required: true, message: 'Vui lòng nhập mã chất liệu' },
                ]}
                className="form-group form-group-with-search"
                name="code"
                labelAlign="right"
                label="Mã chất liệu"
              >
                <Input className="r-5" placeholder="Mã chất liệu" size="large" />
              </Form.Item>
            </Col>
            <Col offset={1} span={8}>
              <Form.Item
                className="form-group form-group-with-search"
                name="description"
                label="Ghi chú"
              >
                <Input className="r-5" placeholder="Mã chất liệu" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Row className="footer-row-btn" justify="end">
        <Button type="default" onClick={onCancel} className="btn-style btn-cancel">Hủy</Button>
        <Button type="default" onClick={onSave} className="btn-style btn-save">Lưu</Button>
      </Row>
    </div>
  )
}

export default AddMaterial;