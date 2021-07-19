import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  RadiusBottomrightOutlined,
  RadiusUprightOutlined,
} from "@ant-design/icons";
import { Modal } from "antd";

type ModalConfirmProps = {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
};

const ModalConfirm: React.FC<ModalConfirmProps> = (
  props: ModalConfirmProps
) => {
  const { visible, onOk, onCancel, title, subTitle, okText, cancelText } =
    props;
  return (
    <Modal
      width="35%"
      className="modal-confirm"
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <div className="modal-confirm-container">
        <div>
          <div style={{ color: "#2A2A86" }} className="modal-confirm-icon">
            <QuestionCircleOutlined />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          {subTitle !== "" && (
            <i className="modal-confirm-sub-title">{subTitle}</i>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirm;
