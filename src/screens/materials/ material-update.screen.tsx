import { Button, Card, Col, Form, FormInstance, Input, Row } from "antd";
import { detailMaterialAction, updateMaterialAction } from "domain/actions/product/material.action";
import { UpdateMaterialRequest } from "model/request/create-material.request";
import { MaterialResponse } from "model/response/product/material.response";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";

type  MaterialPamram = {
  id: string;
}

const UpdateMaterial: React.FC = () => {
  const {id} = useParams<MaterialPamram>();
  const [oldData, setData] = useState<MaterialResponse|null>(null)
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const onSuccess = useCallback(() => {
    history.push('/materials');
  }, [history])
  const onFinish = useCallback((values: UpdateMaterialRequest) => {
    let idNumber = parseInt(id);
    dispatch(updateMaterialAction(idNumber, values, onSuccess));
  }, [dispatch, id, onSuccess]);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  useEffect(() => {
    let idNumber = parseInt(id);
    if(!Number.isNaN(idNumber)) {
      dispatch(detailMaterialAction(idNumber, setData));
    }
  }, [dispatch, id]);
  if(oldData == null) {
    return (
      <Card className="card-block card-block-normal">
        Không tìm thấy chất liệu
      </Card>
    )
  }
  return (
    <div>
      <Card className="card-block card-block-normal" title="Thông tin cơ bản">
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={oldData}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
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
            <Col  span={24} lg={8} md={12} sm={24}>
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
            <Col span={24} lg={8} md={12} sm={24}>
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
            <Col  span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="description"
                label="Ghi chú"
              >
                <Input className="r-5" placeholder="Mã chất liệu" size="large" />
              </Form.Item>
              <Form.Item
                hidden
                className="form-group form-group-with-search"
                name="version"
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

export default UpdateMaterial;