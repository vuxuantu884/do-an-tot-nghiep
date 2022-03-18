import { Form, Input, Modal } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React from 'react';

type Props = {
    isVisiable: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance
}

function ModalFormAnalyticsInfo({
    form,
    isVisiable,
    handleOk,
    handleCancel,

}: Props) {

    return (
        <Modal title="Cài đặt báo cáo" visible={isVisiable} onOk={handleOk} onCancel={handleCancel} okText="Lưu">
            <Form name="analytic-info" form={form} layout="vertical">
                <Form.Item label="Tên báo cáo" name="name" rules={[{ required: true, whitespace: true, message: "Vui lòng nhập tên báo cáo" }]}>
                    <Input type="text" placeholder='Nhập tên báo cáo' />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalFormAnalyticsInfo