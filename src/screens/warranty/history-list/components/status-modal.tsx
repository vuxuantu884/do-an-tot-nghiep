import { Col, Form, Modal, ModalProps, Row, Select } from 'antd';
import React from 'react';

type Props = ModalProps & {

}
WarrantyStatusModal.defaultProps = {
    okText: 'Cập nhật',
}
function WarrantyStatusModal(props: Props) {
    const { onCancel, onOk, ...rest } = props;

    const handleOk = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const event = e;
        onOk?.(event);
    }

    const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const event = e;
        onCancel?.(event);
    }

    return (
        <Modal title="Cập nhật trạng thái bảo hành" onCancel={handleCancel} onOk={handleOk} {...rest}>

            <Row>
                <Col span={24}>
                    <Form.Item label="Trạng thái xử lý sản phẩm" labelCol={{span: 24}}>
                        <Select placeholder="Chọn trạng thái xử lý sản phẩm">

                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Form.Item label="Trạng thái trả khách" labelCol={{span: 24}}>
                        <Select placeholder="Chọn trạng thái trả khách">

                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            
        </Modal>
    )
}

export default WarrantyStatusModal