import React from "react";
import { Modal } from "antd";

import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

type ExitUpdateRankingCustomerModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};

const ExitUpdateRankingCustomerModal: React.FC<ExitUpdateRankingCustomerModalType> = (
  props: ExitUpdateRankingCustomerModalType,
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
      okText="Đồng ý"
      cancelText="Hủy"
      onOk={onOk}
    >
      <div style={{ display: "flex", alignItems: "center", padding: 8 }}>
        <img src={DeleteIcon} alt="" />
        <div style={{ marginLeft: 15 }}>
          <strong style={{ fontSize: 16 }}>
            Bạn có chắc chắn muốn hủy quá trình cập nhập hạng khách hàng không?
          </strong>
          <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc cập nhập hạng khách hàng.</div>
        </div>
      </div>
    </Modal>
  );
};

export default ExitUpdateRankingCustomerModal;
