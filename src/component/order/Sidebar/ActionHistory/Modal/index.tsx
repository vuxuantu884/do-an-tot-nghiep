import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { actionGetActionLogDetail } from "domain/actions/order/order.action";
import purify from "dompurify";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { convertActionLogDetailToText } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  isModalVisible: boolean;
  actionId?: number;
  onCancel: () => void;
};

type SingleLogType = {
  key: string;
  title: string;
  type?: string;
  before: any;
  current: any;
};

function ActionHistoryModal(props: PropTypes) {
  const formatDate = DATE_FORMAT.HHmm_DDMMYYYY;
  const screenHeight = window.screen.height;

  const dispatch = useDispatch();
  const [singleShortenLog, setSingleShortenLog] = useState<SingleLogType[]>([]);
  const [singleLogDetail, setSingleLogDetail] = useState<SingleLogType[]>([]);

  const renderRow = (value: string, row: any) => {
    if (row.type === "html") {
      let doc = new DOMParser().parseFromString(value, "text/html");
      let htmlInner = doc.getElementsByTagName("body")[0].innerHTML;
      return (
        <div
          className="orderDetails"
          dangerouslySetInnerHTML={{
            __html: purify.sanitize(htmlInner),
          }}
        ></div>
      );
    }
    return value;
  };

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
      render: (text: string) => {
        return text;
      },
    },
  ];

  const { onCancel, isModalVisible, actionId } = props;
  const [isShowLogDetail, setIsShowLogDetail] = useState(false);

  const handleCancel = () => {
    onCancel();
    setIsShowLogDetail(false);
  };

  useEffect(() => {
    if (actionId) {
      dispatch(
        actionGetActionLogDetail(actionId, (response) => {
          let detailToTextBefore = convertActionLogDetailToText(response.before?.data, formatDate);
          let detailToTextCurrent = convertActionLogDetailToText(
            response.current?.data,
            formatDate,
          );
          setSingleLogDetail([
            {
              key: "1",
              title: "detail",
              before: response.before?.data || "",
              current: response.current?.data || "",
            },
          ]);
          setSingleShortenLog([
            {
              key: "1",
              type: "text",
              title: "Code",
              before: response.before?.code || "",
              current: response.current?.code || "",
            },
            {
              key: "2",
              type: "html",
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
        }),
      );
    }
  }, [actionId, dispatch, formatDate]);

  return (
    <Modal
      title="Chi tiết log đơn hàng"
      visible={isModalVisible}
      footer={false}
      onCancel={handleCancel}
      width="1200px"
      centered
      bodyStyle={{ maxHeight: screenHeight * 0.6, overflow: "auto" }}
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
            dataSource={singleShortenLog}
            columns={ACTION_LOG_SHORTEN_COLUMN}
            pagination={false}
          />
        )}
      </StyledComponent>
    </Modal>
  );
}

export default ActionHistoryModal;
