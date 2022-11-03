import { Modal, ModalProps } from "antd";
import { TiWarningOutline } from "react-icons/ti";
import { borderColor } from "utils/global-styles/variables";

export interface ModalConfirmProps extends ModalProps {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const ModalConfirm: React.FC<ModalConfirmProps> = (props: ModalConfirmProps) => {
  const {
    visible,
    onOk,
    onCancel,
    title,
    subTitle,
    okText,
    cancelText,
    loading,
    children,
    ...rest
  } = props;

  return (
    <Modal
      confirmLoading={loading}
      width="35%"
      className="modal-confirm"
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      {...rest}
    >
      <div className="modal-confirm-container">
        <div>
          <div
            style={{
              color: "#FFFFFF",
              backgroundColor: "#FCAF17",
              fontSize: "45px",
              paddingBottom: 5,
            }}
            className="modal-confirm-icon"
          >
            <TiWarningOutline />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          {subTitle !== "" && <div className="modal-confirm-sub-title">{subTitle}</div>}
        </div>
      </div>
      {children ? (
        <div
          className="modalContent"
          style={{
            marginTop: 25,
            borderTop: `1px solid ${borderColor}`,
            paddingTop: 25,
          }}
        >
          {children}
        </div>
      ) : null}
    </Modal>
  );
};

export default ModalConfirm;
