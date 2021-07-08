import { Col, Input, Modal, Row, Select, Form } from 'antd';
import arrowDownIcon from '../../../assets/img/drow-down.svg';
import React, { useCallback } from 'react';

type AddAddressModalProps = {
    visible: boolean;
    onCancel: (e: React.MouseEvent<HTMLElement>) => void;
    onOk: () => void;
};

const AddAddressModal: React.FC<AddAddressModalProps> = (
    props: AddAddressModalProps
) => {
    const { visible, onCancel, onOk } = props;
    const onOkPress = useCallback(() => {
        onOk();
    }, [onOk]);
    return (
        <Modal
            title="Thêm địa chỉ"
            visible={visible}
            centered
            okText="Lưu"
            cancelText="Hủy"
            className="update-shipping"
            onOk={onOkPress}
            onCancel={onCancel}
        >
            <Form layout="vertical">
                <Row gutter={24} className="update-form-ship-address">
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search">
                            <Form.Item
                                label="Tên người nhận"
                                name="receiver"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập tên người nhận',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="Tên người nhận"
                                    suffix={
                                        <img src={arrowDownIcon} alt="down" />
                                    }
                                />
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search">
                            <Form.Item
                                label="Khu vực"
                                name="location"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn khu vực',
                                    },
                                ]}
                            >
                                <Select
                                    className="select-with-search"
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="Chọn khu vực"
                                >
                                    <Select.Option value="1">
                                        Thanh Xuân
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search">
                            <Form.Item
                                label="Địa chỉ"
                                name="address"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập địa chỉ',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search">
                            <Form.Item
                                label="Phường xã"
                                name="Phường xã"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng chọn phường xã',
                                    },
                                ]}
                            >
                                <Select
                                    className="select-with-search"
                                    showSearch
                                    style={{ width: '100%' }}
                                    placeholder="Chọn phường xá"
                                >
                                    <Select.Option value="1">
                                        Thanh Xuân
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search mb-0">
                            <Form.Item
                                label="Số điện thoại"
                                name="phone number"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại',
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </div>
                    </Col>
                    <Col xs={24} lg={12}>
                        <div className="form-group form-group-with-search mb-0">
                            <Form.Item
                                label="Số điện thoại khác có thể gọi"
                                name="other phone number"
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddAddressModal;
