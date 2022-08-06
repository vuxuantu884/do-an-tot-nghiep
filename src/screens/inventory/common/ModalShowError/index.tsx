import { Modal } from "antd";
import { TiWarningOutline } from "react-icons/ti";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import React from "react";

export interface ModalShowErrorProps {
  visible?: boolean;
  onOk?: () => void;
  errorData: any;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ModalShowError: React.FC<ModalShowErrorProps> = (props: ModalShowErrorProps) => {
  const { visible, onOk, onCancel, title, okText, cancelText, loading, errorData } = props;

  return (
    <Modal
      confirmLoading={loading}
      width="35%"
      title="Xác nhận?"
      className="modal-confirm"
      okText={okText ? okText : "Thực hiện"}
      cancelText={cancelText ? cancelText : "Hủy"}
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
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="mb-20">{title}</div>
          {errorData.length > 0 && errorData.map((i: any, idx: number) => {
            return (
              <div key={idx}>
                <Link style={{ cursor: "pointer" }} target="_blank" to={`${UrlConfig.INVENTORY_TRANSFERS}/${i.id}`}>
                  {i.code}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ModalShowError;
