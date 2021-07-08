import { Modal } from "antd";
import React from "react";
import { RiDeleteBin5Line } from "react-icons/ri";

type ModalDeleteConfirmProps = {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
};

const ModalDeleteConfirm: React.FC<ModalDeleteConfirmProps> = (
  props: ModalDeleteConfirmProps
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
            style={{ color: "#FFFFFF", background: "#EB5757" }}
            className="modal-confirm-icon"
          >
            <RiDeleteBin5Line />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          <i className="modal-confirm-sub-title">{subTitle}</i>
        </div>
      </div>
    </Modal>
  );
};

export default ModalDeleteConfirm;
