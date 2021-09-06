import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { actionGetActionLogDetail } from "domain/actions/order/order.action";
import purify from "dompurify";
import { useEffect, useState } from "react";
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
  type?: string;
  before: any;
  current: any;
};

function ActionHistoryModal(props: PropType) {
  const dispatch = useDispatch();
  const [singleLogShorten, setSingleLogShorten] = useState<SingleLogType[]>([]);
  const [singleLogDetail, setSingleLogDetail] = useState<SingleLogType[]>([]);

  const renderRow = (value: string, row: any) => {
    if (row.type === "html") {
      let doc = new DOMParser().parseFromString(value, "text/html");
      let htmlInner = doc.getElementsByTagName("body")[0].innerHTML;
      return (
        <div
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
      width: "30%",
    },
    {
      title: "Trước",
      dataIndex: "before",
      key: "before",
      width: "30%",
      render: (value: string, row: any) => {
        console.log("value", value);
        return renderRow(value, row);
      },
    },
    {
      title: "Sau",
      dataIndex: "current",
      key: "current",
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
        // let dataJson = JSON.parse(text);
        // let abc = JSON.stringify(dataJson, undefined, 4);
        // console.log("abc", abc);
        // return abc;
        // return <code>{text}</code>;
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
    const convertActionLogDetailToText = (data?: string) => {
      let result = "";
      if (data) {
        let dataJson = JSON.parse(data);
        result = ` Người tạo: ${dataJson.created_name}.<br/>
                          Khách hàng: ${dataJson.customer}.<br/>
                          Cửa hàng: ${dataJson.store}.<br/>
                          Số điện thoại khách hàng: ${dataJson.store_phone_number}.<br/>
                          Nguồn đơn hàng: ${dataJson.source}.<br/>
        `;
      }
      return result;
    };
    if (actionId) {
      dispatch(
        actionGetActionLogDetail(actionId, (response) => {
          console.log("response", response);
          let detailToTextBefore = convertActionLogDetailToText(
            response.before?.data
          );
          let detailToTextCurrent = convertActionLogDetailToText(
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
  );
}

export default ActionHistoryModal;
