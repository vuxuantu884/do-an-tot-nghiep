import { Form, Row, Col, Card, Select, Button, FormInstance, Input, InputNumber } from 'antd';
import React, { createRef, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { RootReducerType } from "model/reducers/RootReducerType";
import './category.scss';

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
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const formRef = createRef<FormInstance>();
  const onSubmit = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);


  const onFinish = useCallback((values) => {

  }, [dispatch]);

  return (
    <div>
      <Form ref={formRef} layout="vertical" onFinish={onFinish} initialValues={{name: "test", goods: "", code: '', parent_id: -1}}>
        <Row gutter={24}>
          <Col xs={24} lg={24}>
            <Card className="card-block card-block-normal" title={<div className="d-flex">Thông tin cơ bản</div>}>
              <div className="payment-method-content">
                <Row gutter={24}>
                  <Col span={9}>
                    <div className="form-group form-group-with-search">
                      <Form.Item name="name">
                        <label htmlFor="" className="required-label">Tên danh mục</label>
                        <Input placeholder="Nhập tên danh mục" />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={9}>
                    <div className="form-group form-group-with-search">
                      <Form.Item name="goods">
                        <label htmlFor="" className="required-label">Ngành hàng</label>
                        <Select>
                          <Select.Option value="">Ngành hàng</Select.Option>
                          {
                            goods.map((item, index) => (
                              <Select.Option key={index} value={item.value}>
                                {item.name}
                              </Select.Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </div>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={9}>
                    <div className="form-group form-group-with-search">
                      <Form.Item>
                        <label htmlFor="" className="required-label">Mã danh mục</label>
                        <Input placeholder="Tối đa 3 ký tự" />
                      </Form.Item>
                    </div>
                  </Col>
                  <Col span={9}>
                    <div className="form-group form-group-with-search">
                      <Form.Item>
                        <label htmlFor="" className="">Thuộc danh mục</label>
                        <Input placeholder="Chuyển Khoản" />
                      </Form.Item>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="footer-row-btn" justify="end">
          <Button type="default" className="btn-style btn-cancel">Hủy</Button>
          <Button type="default" className="btn-style btn-save">Lưu</Button>
        </Row>
      </Form>
    </div>
  );
}

export default AddCategory;