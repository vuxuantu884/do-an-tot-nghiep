import React from "react";
import { Modal } from "antd";

import checkCircleIcon from "assets/icon/check-circle.svg";
import checkCircleBlueIcon from "assets/icon/check-circle-blue.svg";
import errorIcon from "assets/icon/error.svg";


type ResultDownloadOrderDataModalType = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  downloadOrderData: any;
};


const ResultDownloadOrderDataModal: React.FC<ResultDownloadOrderDataModalType> = (
  props: ResultDownloadOrderDataModalType
) => {
  const { visible, onOk, onCancel, downloadOrderData } = props;
  

  return (
    <Modal
      width="600px"
      className=""
      visible={visible}
      title={"Có " + downloadOrderData?.total + " đơn hàng được cập nhật thành công"}
      okText="Đóng"
      onOk={onOk}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      maskClosable={false}
    >
      <div>
        <div>
          <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "green", display: "inline-block"}}>{downloadOrderData?.create_total}</p> đơn hàng được tải mới thành công</span>
        </div>
        
        <div>
          <img src={checkCircleBlueIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "#2A2A86", display: "inline-block"}}>{downloadOrderData?.update_total}</p> đơn hàng được cập nhật thành công</span>
        </div>

        <div>
          <img src={errorIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "red", display: "inline-block"}}>{downloadOrderData?.error_total}</p> đơn hàng thất bại</span>
        </div>
      </div>
    </Modal>
  );
};

export default ResultDownloadOrderDataModal;
