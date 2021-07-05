import { Button, Card, Col, Form, FormInstance, Input, Row, Space } from 'antd';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';
import { createMaterialAction } from 'domain/actions/product/material.action';
import { MaterialCreateRequest } from 'model/product/material.model';
import { createRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';

let initialRequest: MaterialCreateRequest = {
    code: '',
    component: '',
    description: '',
    name: '',
};

const AddMaterial: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const formRef = createRef<FormInstance>();
    const onSuccess = useCallback(() => {
        history.push(UrlConfig.MATERIALS);
    }, [history]);
    const onFinish = useCallback(
        (values: MaterialCreateRequest) => {
            dispatch(createMaterialAction(values, onSuccess));
        },
        [dispatch, onSuccess]
    );
    const onCancel = useCallback(() => {
        history.goBack();
    }, [history]);
    return (
        <ContentContainer
            title="Thêm chất liệu"
            breadcrumb={[
                {
                    name: 'Tổng quản',
                    path: '/',
                },
                {
                    name: 'Sản phẩm',
                    path: `${UrlConfig.PRODUCT}`,
                },
                {
                    name: 'Chất liệu',
                    path: `${UrlConfig.MATERIALS}`,
                },
                {
                    name: 'Thêm mới',
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
                    <div className="padding-20">
                        <Row gutter={50}>
                            <Col span={24} lg={8} md={12} sm={24}>
                                <Form.Item
                                    className="form-group form-group-with-search"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Vui lòng nhập tên chất liệu',
                                        },
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
                                            message:
                                                'Vui lòng nhập thành phần chất liệu',
                                        },
                                        {
                                            max: 50,
                                            message:
                                                'Tên chất liệu không vượt quá 50 ký tự',
                                        },
                                    ]}
                                    className="form-group form-group-with-search"
                                    name="component"
                                    label="Thành phần"
                                >
                                    <Input
                                        className="r-5"
                                        placeholder="Thành phần"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={50}>
                            <Col span={24} lg={8} md={12} sm={24}>
                                <Form.Item
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Vui lòng nhập mã chất liệu',
                                        },
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
                <div className="margin-top-10" style={{ textAlign: 'right' }}>
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

export default AddMaterial;
