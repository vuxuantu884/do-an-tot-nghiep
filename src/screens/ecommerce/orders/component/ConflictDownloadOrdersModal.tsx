import React from "react";
import { Button, Modal } from "antd";

import notificationIcon from "assets/icon/notification.svg";


type ConflictDownloadOrdersModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};


const ConflictDownloadOrdersModal: React.FC<ConflictDownloadOrdersModalType> = (
  props: ConflictDownloadOrdersModalType
) => {
  const { visible, onOk, onCancel } = props;


  return (
    <Modal
      width="600px"
      centered
      visible={visible}
      title=""
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <Button type="primary" onClick={onOk} >
          Đồng ý
        </Button>
      }
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={notificationIcon} alt="" />
        <div style={{ marginLeft: 15 }}>
          <strong style={{ fontSize: 16 }}>Không thể thực hiện thao tác!</strong>
          <div style={{ fontSize: 14 }}>Đang có tài khoản khác đang thực hiện thao tác này.</div>
        </div>
      </div>
    </Modal>
  );
};

export default ConflictDownloadOrdersModal;
