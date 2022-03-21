import React, { useState } from "react";
import { Modal } from "antd";

import checkCircleIcon from "assets/icon/check-circle.svg";
import errorIcon from "assets/icon/error.svg";
import CustomTable from "component/table/CustomTable";


type ResultConnectProductModalType = {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  connectProductData: any;
};


const ResultConnectProductModal: React.FC<ResultConnectProductModalType> = (
  props: ResultConnectProductModalType
) => {
  const { visible, onOk, onCancel, connectProductData } = props;
  

  const [columns] = useState<any>([
    {
      title: "STT",
      align: "center",
      width: "5%",
      render: (item: any, row: any, index: any) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Nội dung",
      render: (item: any, row: any, index: any) => {
        return <div>Sản phẩm <strong>{item}</strong> ghép nối không thành công</div>
      },
    },
  ]);

  return (
    <Modal
      width="600px"
      className=""
      visible={visible}
      title={"Có " + connectProductData?.total + " sản phẩm được ghép nối."}
      okText="Đóng"
      onOk={onOk}
      onCancel={onCancel}
      cancelButtonProps={{ style: { display: 'none' } }}
      maskClosable={false}
    >
      <div>
        <div>
          <img src={checkCircleIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "green", display: "inline-block"}}>{connectProductData?.success_total}</p> sản phẩm ghép nối thành công</span>
        </div>

        <div style={{ marginBottom: 10 }} >
          <img src={errorIcon} style={{ marginRight: 5 }} alt="" />
          <span>Có <p style={{color: "red", display: "inline-block"}}>{connectProductData?.error_total}</p> sản phẩm ghép nối thất bại</span>
        </div>

        {/* Danh sách sản phẩm ghép nối thất bại */}
        {connectProductData?.error_total > 0 &&
          <CustomTable
            columns={columns}
            dataSource={connectProductData?.error_list}
            pagination={false}
            rowKey={(data) => data.id}
          />
        }
      </div>
    </Modal>
  );
};

export default ResultConnectProductModal;
