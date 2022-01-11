import React from "react";
import { Modal,} from "antd";

import DeleteIcon from "assets/icon/ydDeleteIcon.svg";


type ExitDownloadOrdersModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};


const ExitDownloadOrdersModal: React.FC<ExitDownloadOrdersModalType> = (
  props: ExitDownloadOrdersModalType
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={DeleteIcon} alt="" />
        <div style={{ marginLeft: 15 }}>
          <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy tải đơn hàng về không?</strong>
          <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc tải đơn về, các đơn hàng đã tải thành công sẽ được hiển thị ở màn hình "Đồng bộ đơn hàng"</div>
        </div>
      </div>
    </Modal>
    
  );
};

export default ExitDownloadOrdersModal;
