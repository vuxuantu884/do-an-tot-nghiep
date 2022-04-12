import { Input, Modal, ModalProps } from 'antd'
import React from 'react'

type Props = ModalProps & {

}
FeeModal.defaultProps = {
    okText: 'Cập nhật',
}
function FeeModal(props: Props) {
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
        <Modal title="Phí sửa chữa bảo hành" onCancel={handleCancel} onOk={handleOk} {...rest}>
            <Input placeholder='Nhập phí sửa chữa bảo hành' />
        </Modal>
    )
}

export default FeeModal