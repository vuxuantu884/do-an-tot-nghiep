import React from "react";
import { Modal } from "antd";
import { ConfirmCancelModalStyled } from "screens/promotion/campaign/campaign.style";
import WarningExclamationCircleIcon from "assets/icon/warning-exclamation-circle.svg";
import CloseIcon from "assets/icon/X_close.svg";

const ConfirmCancelModal = (props: any) => {
  const { visible, onCancel, onOk } = props;

  return (
    <Modal
      centered
      visible={visible}
      maskClosable={false}
      width="400px"
      title=""
      closable={false}
      onCancel={onCancel}
      okText="Đồng ý"
      cancelText="Ở lại"
      onOk={onOk}
    >
      <ConfirmCancelModalStyled>
        <div className="header-modal">
          <div>
            <img src={WarningExclamationCircleIcon} alt="" style={{ marginRight: "16px" }} />
            <span>Chú ý</span>
          </div>
          <img
            src={CloseIcon}
            alt="close-modal-icon"
            onClick={onCancel}
            style={{ width: "25px", height: "25px" }}
          />
        </div>
        <div className="content-modal">
          <div>Mọi thay đổi sẽ không được lưu lại.</div>
          <div>Bạn có đồng ý thoát?</div>
        </div>
      </ConfirmCancelModalStyled>
    </Modal>
  );
};
export default ConfirmCancelModal;
