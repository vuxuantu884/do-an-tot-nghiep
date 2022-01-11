import React from "react";
import { Modal,} from "antd";

import DeleteIcon from "assets/icon/ydDeleteIcon.svg";


type ExitDownloadProductsModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
};


const ExitDownloadProductsModal: React.FC<ExitDownloadProductsModalType> = (
  props: ExitDownloadProductsModalType
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
          <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy tải sản phẩm về không?</strong>
          <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc tải sản phẩm về, các sản phẩm đã tải thành công sẽ được hiển thị ở màn hình "Tất cả sản phẩm"</div>
        </div>
      </div>
    </Modal>
    
  );
};

export default ExitDownloadProductsModal;
