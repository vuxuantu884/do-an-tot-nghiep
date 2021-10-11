import React from "react";
import { Modal } from "antd";

import checkCircleIcon from "assets/icon/check-circle.svg";
import errorIcon from "assets/icon/error.svg";


type ResultDownloadOrderDataModalType = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  data: any;
};


const ResultDownloadOrderDataModal: React.FC<ResultDownloadOrderDataModalType> = (
  props: ResultDownloadOrderDataModalType
) => {
  const { visible, onOk, onCancel, data } = props;
  

  return (
    <Modal
      width="600px"
      className=""
      visible={visible}
      title={"Có " + data.total + " đơn hàng được cập nhật thành công"}
      okText="Đóng"
      onOk={onOk}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <div>
        <div>
          <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "green", display: "inline-block"}}>{data.create_total}</p> đơn hàng được tải mới thành công</span>
        </div>
        <div>
          <img src={errorIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "red", display: "inline-block"}}>{data.update_total}</p> đơn hàng thất bại</span>
        </div>
      </div>
    </Modal>
  );
};

export default ResultDownloadOrderDataModal;
