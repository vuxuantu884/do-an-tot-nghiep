import { Button, Modal, Typography } from "antd";
import { TiWarningOutline } from "react-icons/ti";
import React from "react";

type ModalConfirmProps = {
  isVisible?: boolean;
  onOk?: (isOnly: boolean) => void;
  onCancel?: () => void;
  onNext?: () => void;
  bgIcon?: string;
  onClickOutside?: () => void;
}

const ModalConfirmPrice: React.FC<ModalConfirmProps> = (props: ModalConfirmProps) => {
  const { isVisible, onOk, onCancel, onClickOutside } = props;
  return (
    <Modal
      width="35%"
      className="modal-confirm"
      visible={isVisible}
      onCancel={onClickOutside}
      footer={[
        <Button
          onClick={() => {
            onClickOutside && onClickOutside();
            onCancel && onCancel();
          }}
        >
          Hủy
        </Button>,
        <Button
          onClick={() => {
            onOk && onOk(false);
          }}
        >
          Lưu & Cập nhật nhanh
        </Button>,
        <Button
          onClick={() => {
            onOk && onOk(true);
          }}
          type="primary"
        >
          Lưu
        </Button>,
      ]}
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
          <div className="modal-confirm-title">Bạn đã thay đổi giá bán của một phiên bản</div>

          <div className="modal-confirm-sub-title">
            Bạn có muốn <Typography.Link> Cập nhật nhanh</Typography.Link> giá bán cho các phiên bản
            khác?
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmPrice;
