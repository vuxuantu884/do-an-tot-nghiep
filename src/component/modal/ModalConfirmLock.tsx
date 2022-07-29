import { LockOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import React from "react";

type ModalConfirmLockProps = {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
};

const ModalConfirmLock: React.FC<ModalConfirmLockProps> = (props: ModalConfirmLockProps) => {
  const { visible, onOk, onCancel, title, subTitle, okText, cancelText } = props;
  return (
    <Modal
      width="35%"
      className="modal-confirm"
      okText={okText ? okText : "Khóa"}
      cancelText={cancelText ? cancelText : "Thoát"}
      cancelButtonProps={{
        style: { backgroundColor: "white", border: "1px solid #E5E5E5" },
      }}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <div className="modal-confirm-container">
        <div>
          <div style={{ color: "#FFFFFF", background: "#71767B" }} className="modal-confirm-icon">
            <LockOutlined />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          <div className="modal-confirm-sub-title" style={{ color: "#666666", opacity: 1 }}>
            {subTitle}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmLock;
