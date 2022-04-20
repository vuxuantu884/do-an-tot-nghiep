import { Input, Modal, ModalProps } from 'antd'
import React from 'react'

type Props = ModalProps & {

}
NoteModal.defaultProps = {
    okText: 'Cập nhật',
}
function NoteModal(props: Props) {
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
        <Modal title="Ghi chú" onCancel={handleCancel} onOk={handleOk} {...rest}>
            <Input.TextArea placeholder='Nhập ghi chú' rows={5} />
        </Modal>
    )
}

export default NoteModal