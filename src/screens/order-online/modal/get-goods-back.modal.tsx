import { Modal } from "antd";

type GetGoodsBackModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
};

const GetGoodsBack: React.FC<GetGoodsBackModalProps> = (
  props: GetGoodsBackModalProps
) => {
  const {
    visible,
    onCancel,
    onOk,
    text,
    title,
    icon,
    okText,
    cancelText,
  } = props;

  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      title={[
        <div key="1" style={{display: "flex", alignItems: "center"}}>
          <img src={icon} alt="" style={{marginRight: 15}}/>
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
    ></Modal>
  );
};

export default GetGoodsBack;
