import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useState } from "react";
import { StyledComponent } from "./styles";

type PropType = {
  isModalVisible: boolean;
  onCancel: () => void;
};

function ActionHistoryModal(props: PropType) {
  const FAKE_LOG_SHORTEN = [
    {
      key: "1",
      title: "Code",
      before: null,
      after: 200,
    },
    {
      key: "2",
      title: "Data",
      before: "Mảng dữ liệu",
      after: "	Mảng dữ liệu",
    },
    {
      key: "3",
      title: "Message",
      before: null,
      after:
        "Do diễn biến phức tạp của dịch Covid-19, thời gian giao hàng có thể dài hơn dự kiến từ 1-5 ngày.",
    },
  ];

  const FAKE_LOG_SHORTEN_COLUMN = [
    {
      title: "Nội dung thay đổi",
      dataIndex: "title",
      key: "title",
      width: "30%",
    },
    {
      title: "Trước",
      dataIndex: "before",
      key: "before",
      width: "30%",
    },
    {
      title: "Sau",
      dataIndex: "after",
      key: "after",
    },
  ];

  const FAKE_LOG_DETAIL = [
    {
      key: "1",
      before: `
      {
        Array
        (
            [requestCarrier] => Array
                (
                    [to_name] => c La
                    [to_phone] => 0915622182
                    [to_address] => ĐÀO THỊ THÚY LA THON GỐM XÃ THỤY LÔI HUYỆN KIM BẢNG TỈNH HÀ NAM
                    [to_ward_code] => 240316
                    [to_district_id] => 1952
                    [return_phone] => 02499966668
                    [return_address] => 151 Nguyễn Du, Vị 
        
        }
      `,
      after: `
      {
        {
        Array
        (
            [requestCarrier] => Array
                (
                    [to_name] => c La
                    [to_phone] => 0915622182
                    [to_address] => ĐÀO THỊ THÚY LA THON GỐM XÃ THỤY LÔI HUYỆN KIM BẢNG TỈNH HÀ NAM
                    [to_ward_code] => 240316
                    [to_district_id] => 1952
                    [return_phone] => 02499966668
                    [return_address] => 151 Nguyễn Du, Vị 
        
        }
        
        }
      `,
    },
  ];

  const FAKE_LOG_DETAIL_COLUMN = [
    {
      title: "Trước",
      dataIndex: "before",
      key: "before",
      width: "50%",
    },
    {
      title: "Sau",
      dataIndex: "after",
      key: "after",
      width: "50%",
    },
  ];

  const { onCancel, isModalVisible } = props;
  const [isShowLogDetail, setIsShowLogDetail] = useState(false);

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title="Chi tiết log đơn hàng"
      visible={isModalVisible}
      footer={false}
      onCancel={handleCancel}
      width="814px"
    >
      <StyledComponent>
        <div className="sectionButton">
          <Button
            type="primary"
            className="buttonView"
            onClick={() => {
              setIsShowLogDetail(!isShowLogDetail);
            }}
          >
            {isShowLogDetail ? "Xem rút gọn" : "Chi tiết log"}
          </Button>
        </div>
        {isShowLogDetail ? (
          <Table
            dataSource={FAKE_LOG_DETAIL}
            columns={FAKE_LOG_DETAIL_COLUMN}
            pagination={false}
          />
        ) : (
          <Table
            dataSource={FAKE_LOG_SHORTEN}
            columns={FAKE_LOG_SHORTEN_COLUMN}
            pagination={false}
          />
        )}
      </StyledComponent>
    </Modal>
  );
}

export default ActionHistoryModal;
