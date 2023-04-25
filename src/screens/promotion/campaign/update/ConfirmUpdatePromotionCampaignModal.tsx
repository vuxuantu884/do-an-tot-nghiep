import React from "react";
import { Modal } from "antd";
import { ConfirmCancelModalStyled } from "screens/promotion/campaign/campaign.style";
import WarningExclamationCircleIcon from "assets/icon/warning-exclamation-circle.svg";
import CloseIcon from "assets/icon/X_close.svg";

const ConfirmUpdatePromotionCampaignModal = (props: any) => {
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
      cancelText="Kiểm tra lại"
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
          <div>Chương trình đã có sự thay đổi. Các thay đổi có thể ảnh hưởng đến các chương trình khuyến mại con trong chiến dịch.</div>
          <div>Bạn đồng ý lưu các thay đổi này?</div>
        </div>
      </ConfirmCancelModalStyled>
    </Modal>
  );
};
export default ConfirmUpdatePromotionCampaignModal;
