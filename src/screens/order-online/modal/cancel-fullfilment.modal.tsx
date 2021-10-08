import { Modal, Button } from "antd";

type cancelFullfilmentModalProps = {
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  onOkandMore: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
  isCanceling?: boolean;
};

const CancelFullfilmentModal: React.FC<cancelFullfilmentModalProps> = (
  props: cancelFullfilmentModalProps
) => {
  const { visible, onCancel, onOk, text, title, icon, okText, isCanceling, cancelText } =
    props;
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      title={[
        <div>
          <img src={icon} alt="" />
          <div>
            <h4>{title}</h4>
            <span
              style={
                title ? { fontWeight: 400 } : { fontWeight: 600, fontSize: 16 }
              }
            >
              {text}
            </span>
          </div>
        </div>,
      ]}
      width={600}
      className="saleorder-modal-config"
      footer={[
        <Button key="back" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="cancel"
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={onOk}
          loading={isCanceling}
        >
          {okText}
        </Button>,
        <Button key="cancel-and-goods-back" type="primary" onClick={props.onOkandMore}>
          Hủy giao và nhận lại hàng
        </Button>,
      ]}
    ></Modal>
  );
};

export default CancelFullfilmentModal;
