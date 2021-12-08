import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { actionGetActionLogDetail } from "domain/actions/order/order.action";
import purify from "dompurify";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { StyledComponent } from "./styles";
import moment from "moment";

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
    const convertActionLogDetailToText = (data?: string) => {
      let result = "";
      if (data) {
        let dataJson = JSON.parse(data);
        console.log("dataJson", dataJson);
        result = `
        <span style="color:red">Thông tin đơn hàng: </span><br/> 
        - Nhân viên: ${dataJson.created_name}<br/>
        - Trạng thái : ${dataJson.status_after}<br/>
        - Nguồn : ${dataJson.source}<br/>
        - Cửa hàng : ${dataJson.store}<br/>
        - Địa chỉ cửa hàng : ${dataJson.store_full_address}<br/>
        - Thời gian: ${moment(dataJson.updated_date).format(dateFormat)}<br/>
        - Ghi chú: ${dataJson.note} <br/>
        <br/>
        <span style="color:red">Sản phẩm: </span><br/> 
        ${dataJson.items
          .map((singleItem: any, index: any) => {
            return `
        - Sản phẩm ${index + 1}: ${singleItem.product} <br/>
          + Đơn giá: ${singleItem.price} <br/>
          + Số lượng: ${singleItem.quantity} <br/>
          + Thuế : ${singleItem.tax_rate || 0} <br/>
          + Chiết khấu sản phẩm: ${singleItem.discount_value || 0} <br/>
          + Thành tiền: ${singleItem.amount} <br/>
          `;
          })
          .join("<br/>")}
        <br/>
        <span style="color:red">Phiếu đóng gói: </span><br/> 
        - Địa chỉ giao hàng: ${`${dataJson.shipping_address.full_address}, ${dataJson.shipping_address.ward}, ${dataJson.shipping_address.district}, ${dataJson.shipping_address.city}`} <br/>
        - Địa chỉ nhận hóa đơn: ${`${dataJson.shipping_address.full_address}, ${dataJson.shipping_address.ward}, ${dataJson.shipping_address.district}, ${dataJson.shipping_address.city}`} <br/>
        - Phương thức giao hàng: ${
          dataJson.fulfillments[0].shipment.delivery_service_provider
        } <br/>
        - Trạng thái: ${dataJson.fulfillments[0].status} <br/>
        <br/>
        <span style="color:red">Thanh toán: </span><br/>  
        ${
          dataJson.payments.length <= 0
            ? `-Chưa thanh toán`
            : dataJson.payments
                .map((singlePayment: any, index: number) => {
                  return `
                  - ${singlePayment.payment_method}: ${singlePayment.paid_amount}
                `;
                })
                .join("<br/>")
        }
        `;
      }
      return result;
    };
    if (actionId) {
      dispatch(
        actionGetActionLogDetail(actionId, (response) => {
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
  );
}

export default ActionHistoryModal;
