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
  before: any;
  current: any;
};

function ActionHistoryModal(props: PropType) {
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
        let doc = new DOMParser().parseFromString(text, "text/html");
        let htmlInner = doc.getElementsByTagName("body")[0].innerHTML;
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(htmlInner),
            }}
          ></div>
        );
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
          console.log("response", response);
          let resultCurrent = "";
          if (response.current.data) {
            let dataJson = JSON.parse(response.current.data);
            console.log("dataJson", dataJson);
            resultCurrent = ` Người tạo: ${dataJson.created_name}.<br/>
                              Khách hàng: ${dataJson.customer}.<br/>
                              Cửa hàng: ${dataJson.store}.<br/>
                              Số điện thoại khách hàng: ${dataJson.store_phone_number}.<br/>
                              Nguồn đơn hàng: ${dataJson.source}.<br/>
            `;
          }
          setSingleLogDetail([
            {
              key: "1",
              title: "detail",
              before: response.before?.data || "",
              current: resultCurrent || "",
            },
          ]);
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
