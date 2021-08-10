import { Modal } from "antd";

type SaveAndConfirmOrderModalProps = {
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string
  okText: string
};

const SaveAndConfirmOrder: React.FC<SaveAndConfirmOrderModalProps> = (
  props: SaveAndConfirmOrderModalProps
) => {
  const { visible, onCancel, onOk, text, title, icon, okText, cancelText } = props;
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      title={[
        <div key="save-and-confirm">
          <img src={icon} />
          <div>
            <h4>{title}</h4>
            <span style={title ?{fontWeight: 400} : {fontWeight: 600, fontSize: 16}}>{text}</span>
          </div>
        </div>,
      ]}
      width={600}
      className="saleorder-modal-config"
    >
    </Modal>
  );
};

export default SaveAndConfirmOrder;

