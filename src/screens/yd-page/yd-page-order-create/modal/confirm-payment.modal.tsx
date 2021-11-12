import { Modal} from 'antd';

type ConfirmPaymentModalProps = {
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
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
            title="Bạn muốn xác nhận thanh toán cho đơn hàng này?"
            className="saleorder-modal-config"
        >
            <span>
                {props.text}
            </span>
        </Modal>
  )
}

export default ConfirmPaymentModal;