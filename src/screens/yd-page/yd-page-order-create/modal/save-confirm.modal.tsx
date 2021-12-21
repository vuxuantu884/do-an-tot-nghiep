import { Button, Modal } from "antd";

type SaveAndConfirmOrderModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  updateShipment?: boolean;
  cancelShipment?: boolean;
  text: string;
  title: string;
  icon: string;
  cancelText: string
  okText: string
};

const SaveAndConfirmOrder: React.FC<SaveAndConfirmOrderModalProps> = (
  props: SaveAndConfirmOrderModalProps
) => {
  const { visible, onCancel, onOk, text, title, icon, okText, updateShipment = false, cancelShipment = false, cancelText } = props;
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      closable={!(updateShipment || cancelShipment)}
      title={[
        <div key="1" style={{display: "flex"}}>
          <img src={icon} alt="" style={{marginRight: 20}}/>
          <div>
            <h4>{title}</h4>
            <span style={title ?{fontWeight: 400} : {fontWeight: 600, fontSize: 16}}>{text}</span>
          </div>
        </div>,
      ]}
      footer={[
        <div>
          <Button type="primary" onClick={onOk} loading={updateShipment || cancelShipment}>
            {okText}
          </Button>
          <Button onClick={onCancel} disabled={updateShipment || cancelShipment}>
            {cancelText}
          </Button>
        </div>,
      ]}
      width={600}
      className="saleorder-modal-config"
    >
    </Modal>
  );
};

export default SaveAndConfirmOrder;

