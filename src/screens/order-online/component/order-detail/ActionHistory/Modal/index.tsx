import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { actionGetActionLogDetail } from "domain/actions/order/order.action";
import { ActionLogDetailResponse } from "model/response/order/action-log.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { StyledComponent } from "./styles";

type PropType = {
  isModalVisible: boolean;
  actionId?: number;
  onCancel: () => void;
};

type SingleLogType = {
  key: string;
  title: string;
  before: any;
  current: any;
};

function ActionHistoryModal(props: PropType) {
  const [actionHistoryDetail, setActionHistoryDetail] =
    useState<ActionLogDetailResponse>();
  const dispatch = useDispatch();
  const [singleLogShorten, setSingleLogShorten] = useState<SingleLogType[]>([]);
  const [singleLogDetail, setSingleLogDetail] = useState<SingleLogType[]>([]);

  const ACTION_LOG_SHORTEN_COLUMN = [
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
      dataIndex: "current",
      key: "current",
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
      dataIndex: "current",
      key: "current",
      width: "50%",
    },
  ];

  const { onCancel, isModalVisible, actionId } = props;
  const [isShowLogDetail, setIsShowLogDetail] = useState(false);

  const handleCancel = () => {
    onCancel();
  };

  useEffect(() => {
    if (actionId) {
      dispatch(
        actionGetActionLogDetail(actionId, (response) => {
          console.log("response", response);
          setSingleLogShorten([
            {
              key: "1",
              title: "Code",
              before: response.before?.code || "",
              current: response.current?.code || "",
            },
            {
              key: "2",
              title: "Data",
              before: "Mảng dữ liệu",
              current: "Mảng dữ liệu",
            },
            {
              key: "3",
              title: "Message",
              before: response.before?.status || "",
              current: response.current?.status || "",
            },
          ]);
          setSingleLogDetail([
            {
              key: "1",
              title: "detail",
              before: response.before?.data || "",
              current: response.current?.data || "",
            },
          ]);
        })
      );
    }
  }, [actionId, dispatch]);

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
            dataSource={singleLogDetail}
            columns={FAKE_LOG_DETAIL_COLUMN}
            pagination={false}
          />
        ) : (
          <Table
            dataSource={singleLogShorten}
            columns={ACTION_LOG_SHORTEN_COLUMN}
            pagination={false}
          />
        )}
      </StyledComponent>
    </Modal>
  );
}

export default ActionHistoryModal;
