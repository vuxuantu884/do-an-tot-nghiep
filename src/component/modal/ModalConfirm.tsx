import { Modal, ModalProps } from "antd";
import { TiWarningOutline } from "react-icons/ti";
import { borderColor } from "utils/global-styles/variables";
import React from "react";

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
  isHiddenIcon?: boolean;
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
    isHiddenIcon = false,
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
        {!isHiddenIcon && (
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
        )}
        <div className={`modal-confirm-right ${!isHiddenIcon && "margin-left-20"}`}>
          <div className="modal-confirm-title">{title}</div>
          {subTitle !== "" && <div className="modal-confirm-sub-title">{subTitle}</div>}
        </div>
      </div>
      {children ? (
        <div
          className="modalContent"
          style={{
            marginTop: 15,
            borderTop: `1px solid ${borderColor}`,
            paddingTop: 20,
          }}
        >
          {children}
        </div>
      ) : null}
    </Modal>
  );
};

export default ModalConfirm;
