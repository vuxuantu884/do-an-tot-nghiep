import React, { useEffect, useState } from 'react'
import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useDispatch } from 'react-redux';
import purify from "dompurify";
import moment from 'moment';
import { StyledComponent } from "./styles";
import { POGetActionLogDetail } from 'domain/actions/po/po.action';


type PropType = {
  isModalVisible: boolean;
  actionId?: number;
  onCancel: () => void;
}

type SingleLogType = {
  key: string;
  title: string;
  type?: string;
  before: any;
  current: any;
};

function ActionPurchaseORderHistoryModal(props: PropType) {
  const dateFormat = "HH:mm DD/MM/YYYY";

  const dispatch = useDispatch();
  const [singleLogShorten, setSingleLogShorten] = useState<SingleLogType[]>([]);
  const [singleLogDetail, setSingleLogDetail] = useState<SingleLogType[]>([]);

  const renderRow = (value: string, row: any) => {
    if (row.type === "html") {
      let doc = new DOMParser().parseFromString(value, "text/html");
      let htmlInner = doc.getElementsByTagName("body")[0].innerHTML;

      return (
        <div
          className="purchaseOrderDetails"
          dangerouslySetInnerHTML={{
            __html: purify.sanitize(htmlInner),
          }}
        ></div>
      );
    }
    return value;
  }

  const ACTION_LOG_SHORTEN_COLUMN = [
    {
      title: "Nội dung thay đổi",
      dataIndex: "title",
      key: "title",
      width: "20%",
    },
    {
      title: "Trước",
      dataIndex: "before",
      key: "before",
      width: "40%",
      render: (value: string, row: any) => {
        return renderRow(value, row);
      },
    },
    {
      title: "Sau",
      dataIndex: "current",
      key: "current",
      width: "40%",
      render: (value: string, row: any) => {
        return renderRow(value, row);
      },
    },
  ];

  const ACTION_LOG_DETAIL_COLUMN = [
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
      render: (Element: any) => {
        if (typeof Element === "string") {
          return Element;
        }
        return Element();
      },
    },
  ];

  const { onCancel, isModalVisible, actionId } = props;
  const [isShowLogDetail, setIsShowLogDetail] = useState(false);

  const handleCancel = () => {
    onCancel();
    setIsShowLogDetail(false);
  };

  const renderActionLog = (data?: string) => {
    const dataJson = JSON.parse(data || '');
    if (data) {
      return (
        <div>
          <div>{`Nhân viên: ${dataJson.created_name}`}</div>
          <div>{`Trạng thái: ${dataJson.status_after}`}</div>
          <div>{`Địa chỉ nhà cung cấp: ${dataJson?.supplier_address?.fullAddress}`}</div>
          <div>{`Thời gian: ${moment(dataJson.updated_date).format(dateFormat)}`}</div>
        </div>
      );
    }
    return (<></>)
  }

  useEffect(() => {
    if (actionId) {
      dispatch(
        POGetActionLogDetail(actionId, (response) => {
          let detailToTextBefore = renderActionLog(
            response.before?.data
          );
          let detailToTextCurrent = renderActionLog(
            response.current?.data
          );
          setSingleLogDetail([
            {
              key: "1",
              title: "detail",
              before: response.before?.data || "",
              current: response.current?.data || "",
            },
          ]);
          setSingleLogShorten([
            {
              key: "1",
              type: "text",
              title: "Code",
              before: response.before?.code || "",
              current: response.current?.code || "",
            },
            {
              key: "2",
              type: "jsx",
              title: "Data",
              before: detailToTextBefore,
              current: detailToTextCurrent,
            },
            {
              key: "3",
              type: "text",
              title: "IP",
              before: response.before?.ip_address || "",
              current: response.current?.ip_address || "",
            },
            {
              key: "4",
              type: "text",
              title: "Thiết bị",
              before: response.before?.device || "",
              current: response.current?.device || "",
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
      width="1200px"
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
            columns={ACTION_LOG_DETAIL_COLUMN}
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
  )
}

export default ActionPurchaseORderHistoryModal
