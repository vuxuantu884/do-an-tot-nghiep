import { Modal } from "antd";

type SaveAndConfirmOrderModalProps = {
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
  title: string;
  icon: string;
};

const SaveAndConfirmOrder: React.FC<SaveAndConfirmOrderModalProps> = (
  props: SaveAndConfirmOrderModalProps
) => {
  const { visible, onCancel, onOk, text, title, icon } = props;
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText="Đồng ý"
      cancelText="Hủy"
      title={[
        <div>
          <img src={icon} />
          <div>
            <h4>{title}</h4>
            <span>{text}</span>
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

