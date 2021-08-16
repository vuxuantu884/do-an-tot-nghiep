import { Modal } from "antd";
import { TiWarningOutline } from "react-icons/ti";

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
          <div
            style={{
              color: "#FFFFFF",
              backgroundColor: "#FCAF17",
              fontSize: "45px",
            }}
            className="modal-confirm-icon"
          >
            <TiWarningOutline />

            {/* <QuestionCircleOutlined /> */}
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
