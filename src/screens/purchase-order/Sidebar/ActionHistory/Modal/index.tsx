import React, { useEffect, useState } from 'react'
import { Button, Table } from "antd";
import Modal from "antd/lib/modal/Modal";
import { useDispatch } from 'react-redux';
import purify from "dompurify";
import moment from 'moment';
import { StyledComponent } from "./styles";
import { POGetActionLogDetail } from 'domain/actions/po/po.action';
import { PO_RETURN_HISTORY } from 'utils/Constants';

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

  const renderSingleActionLogTitle = (action?: string) => {
    if (!action) {
      return;
    }
    let result = action;
    const resultAction = PO_RETURN_HISTORY?.find((singleStatus) => {
      return singleStatus.code === action;
    });
    if (resultAction && resultAction.title) {
      result = resultAction.title || action;
    }
    return result;
  };


  useEffect(() => {
    const renderActionLog = (data?: string) => {
      if (data) {
        const dataJson = JSON.parse(data || '{}');
        console.log("123", dataJson);
        return (
          <div>
            <div>{`Nhân viên: ${dataJson.created_name}`}</div>
            <div>{`Trạng thái: ${renderSingleActionLogTitle(dataJson.status)}`}</div>
            <div>{`Địa chỉ nhà cung cấp: ${dataJson?.billing_address?.fullAddress}`}</div>
            <div>{`Số lượng nhập: ${dataJson?.receipt_quantity}`}</div>
            <div>{`Thời gian: ${moment(dataJson.updated_date).format(dateFormat)}`}</div>
            <div>{`Merchandiser: ${dataJson?.merchandiser}`}</div>
            <div>{`Số diện thoại: ${dataJson?.phone}`}</div>
            <div style={{ color: "red" }}>Thông tin sản phẩm: </div>
            {
              dataJson.line_items?.map((item: any) => (
                <div key={item?.id}>
                  <div style={{ fontWeight: "bold" }}>{`- Tên: ${item.product}`}</div>
                  <div>{`- Loại: ${item.product_type}`}</div>
                  <div>{`- SKU: ${item.sku}`}</div>
                  <div>{`- Số lượng: ${item.quantity}`}</div>
                  <div>{`- Người tạo: ${item.updated_name}`}</div>
                  <div>{`- Thời gian: ${moment(item.updated_date).format(dateFormat)}`}</div>
                </div>
              ))
            }
          </div>
          
        );
      }
      return (<></>)
    }

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
