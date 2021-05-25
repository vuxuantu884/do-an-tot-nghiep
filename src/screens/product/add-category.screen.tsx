import { Form, Row, Col, Select, Button, FormInstance, Input, InputNumber } from 'antd';
import React, { createRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import './product.scss';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};
const formTailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8, offset: 4 },
};

const AddCategory: React.FC = () => {
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [expand, setExpand] = useState(false);
  const [form] = Form.useForm();
  const onSubmit = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);


  const onFinish = useCallback((values) => {

  }, [dispatch]);

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      <h2 className="titleForm">Thông tin cơ bản</h2>
      <Form ref={formRef} style={{ padding: '20px' }} layout="vertical" onFinish={onFinish} initialValues={{}}>
        <div className="site-input-group-wrapper">
          <Row gutter={24}>
            <Col span={10}>
              <Form.Item name="coupon" label="Mã giảm giá">
                <Input
                  placeholder="Tên danh mục"
                  onFocus={(e) => e.target.select()}
                  style={{ width: '50%' }}
                />
              </Form.Item></Col>
          </Row>
          <Form.Item name="coupon" label="Mã giảm giá">
            <Input
              placeholder="Tên danh mục"
              onFocus={(e) => e.target.select()}
              style={{ width: '50%' }}
            />
          </Form.Item>
        </div>

        <div className="site-input-group-wrapper">
          <Form.Item name="coupon" label="Mã giảm giá">
            <Input
              placeholder="Tên danh mục"
              onFocus={(e) => e.target.select()}
              style={{ width: '99%' }}
            />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}

export default AddCategory;