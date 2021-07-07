import { Modal} from 'antd';

type ConfirmPaymentModalProps = {
  visible: boolean;
  order_id: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
}

const ConfirmPaymentModal: React.FC<ConfirmPaymentModalProps> = (props: ConfirmPaymentModalProps) => {
  const {visible, onCancel, onOk} = props
  return (
    <Modal
            onCancel={onCancel}
            onOk={onOk}
            visible={visible}
            centered
            okText="Đồng ý"
            cancelText="Thoát"
            title="Xác nhận thanh toán cho đơn hàng"
        >
            <span>Bạn muốn xác nhận thanh toán cho đơn hàng này?</span> <br/>

            <span>
                Đơn hàng sẽ được duyệt khi xác nhận thanh toán. Bạn không thay
                đổi được thông tin thanh toán của đơn sau khi xác nhận?
            </span>
        </Modal>
  )
}

export default ConfirmPaymentModal;