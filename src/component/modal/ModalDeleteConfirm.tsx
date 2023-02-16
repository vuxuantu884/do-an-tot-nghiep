import { DeleteOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import React from "react";

type ModalDeleteConfirmProps = {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  content?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  footer?: Array<any>;
  width?: string;
};

const ModalDeleteConfirm: React.FC<ModalDeleteConfirmProps> = (props: ModalDeleteConfirmProps) => {
  const { visible, onOk, onCancel, title, subTitle, okText, cancelText, footer, width, content } = props;

  return (
    <Modal
      width={width ? width : "35%"}
      className="modal-confirm"
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
      cancelButtonProps={{
        style: { backgroundColor: "white", border: "1px solid #E5E5E5" },
      }}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={footer}
    >
      <div className="modal-confirm-container">
        <div>
          <div style={{ color: "#FFFFFF", background: "#EB5757" }} className="modal-confirm-icon">
            <DeleteOutlined />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          <div className="modal-confirm-sub-title">{subTitle}</div>
          <div>{content}</div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDeleteConfirm;
