import React, { useState } from "react";
import { Modal } from "antd";

import checkCircleIcon from "assets/icon/check-circle.svg";
import checkCircleBlueIcon from "assets/icon/check-circle-blue.svg";
import errorIcon from "assets/icon/error.svg";
import CustomTable from "screens/ecommerce/table/CustomTable";


type ResultGetOrderDataModalType = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  downloadOrderData: any;
};


const ResultGetOrderDataModal: React.FC<ResultGetOrderDataModalType> = (
  props: ResultGetOrderDataModalType
) => {
  const { visible, onOk, onCancel, downloadOrderData } = props;
  

  const [columns] = useState<any>([
    {
      title: "STT",
      align: "center",
      width: "5%",
      render: (value: any, row: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "ĐH tải thất bại",
      render: (value: any, row: any, index: any) => {
        return <div><strong>{value}</strong></div>
      },
    },
    {
      title: "Nội dung",
      render: (value: any, row: any, index: any) => {
        return <div>
          {downloadOrderData?.error_list.find((item: any) => item.order_sn === value)?.error_message.join(", ")}
        </div>
      },
    },
  ]);

  return (
    <Modal
      width="600px"
      className=""
      visible={visible}
      title={"Có " + downloadOrderData?.total + " đơn hàng được tìm thấy"}
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

        <div style={{ marginBottom: 10 }} >
          <img src={errorIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "red", display: "inline-block"}}>{downloadOrderData?.error_total}</p> đơn hàng thất bại</span>
        </div>

        {/* Danh sách đơn hàng lỗi */}
        {downloadOrderData?.error_total > 0 &&
          <CustomTable
            columns={columns}
            dataSource={downloadOrderData?.error_list.map((item: any) => item.order_sn)}
            pagination={false}
            rowKey={(data) => data.id}
          />
        }
      </div>
    </Modal>
  );
};

export default ResultGetOrderDataModal;
