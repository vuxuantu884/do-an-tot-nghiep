import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Popconfirm, Table } from "antd";
import UrlConfig from "config/url.config";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { OrderWithFulfillmentActiveModel } from "model/order/order.model";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showModalSuccess } from "utils/ToastUtils";
import { PackModelDefaultValue } from "model/pack/pack.model";
import { setPackInfo } from "utils/LocalStorageUtils";

type Props = {
  isVisible?: boolean;
  setIsVisible?: (value: boolean) => void;
  orderPushFalseDelivery: OrderWithFulfillmentActiveModel[];
  setOrderPushFalseDelivery: (data: OrderWithFulfillmentActiveModel[]) => void;
};

interface orderPushFalseDeliveryTable {
  order_id: number;
  order_code: string;
  fulfillment_code?: string;
  fulfillment_id: number;
  pushing_note?: string;
  pushing_status?: string;
  delivery_service_name?: string;
  delivery_service_note?: string;
  is_loading?: boolean;
}

const PackConfirmModal = (props: Props) => {
  const {
    isVisible = false,
    setIsVisible,
    orderPushFalseDelivery,
    setOrderPushFalseDelivery,
  } = props;

  const dispatch = useDispatch();

  //Context
  const orderPackContextData = useContext(OrderPackContext);
  const setSinglePack = orderPackContextData?.setSinglePack;
  const singlePack = orderPackContextData?.singlePack;

  const fulfillmentData = useMemo(() => singlePack?.fulfillments || [], [singlePack]);


  const [data, setData] = useState<orderPushFalseDeliveryTable[]>([]);

  const handlePushFulfillment = useCallback(
    (fulfillmentId: number) => {
      showModalSuccess(
        <>
          <h4>Xử lí đơn đẩy hãng vận chuyển thấy bại:</h4>
          <ul>
            <li> Cách 1: Hủy và tạo lại đơn giao</li>
            <li> Cách 2: Thông báo tình trạng tới vận đơn </li>
          </ul>
        </>,
      );
      // dispatch(showLoading())
      // dispatch(RePushFulFillmentAction(fulfillmentId, (data: any) => {
      //     showModalSuccess(<>
      //         <ul>
      //             <li> Đã gửi yêu cầu đẩy đơn sang hãng vận chuyển</li>
      //             <li> Kiểm tra lại sau 2 phút</li>
      //         </ul>
      //     </>);

      //     dispatch(hideLoading())
      // }, (error: boolean) => {
      //     dispatch(hideLoading())
      // }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [dispatch],
  );

  const handleRemoveFulfillment = useCallback(
    (fulfillmentId: number) => {
      let fulfillmentsCopy = [...fulfillmentData];
      let orderPushFalseDeliveryCopy = [...orderPushFalseDelivery];
      const index = fulfillmentsCopy.findIndex((p) => p.id === fulfillmentId);
      const index1 = orderPushFalseDeliveryCopy.findIndex(
        (p) => p.fulfillment_active?.id === fulfillmentId,
      );
      if (index !== -1) {
        fulfillmentsCopy.splice(index, 1);
        setSinglePack({
          ...new PackModelDefaultValue(),
          ...singlePack,
          fulfillments: fulfillmentsCopy,
        });
        setPackInfo({
          ...new PackModelDefaultValue(),
          ...singlePack,
          fulfillments: fulfillmentsCopy,
        });
      }

      if (index1 !== -1) {
        orderPushFalseDeliveryCopy.splice(index1, 1);
        setOrderPushFalseDelivery(orderPushFalseDeliveryCopy);
      }
    },
    [fulfillmentData, orderPushFalseDelivery, setOrderPushFalseDelivery, setSinglePack, singlePack],
  );

  useEffect(() => {
    if (orderPushFalseDelivery) {
      let result: orderPushFalseDeliveryTable[] = orderPushFalseDelivery.map((p) => {
        return {
          order_id: p.id,
          order_code: p.code,
          fulfillment_code: p.fulfillment_active?.code || "",
          fulfillment_id: p.fulfillment_active?.id || 0,
          pushing_note: p.fulfillment_active?.shipment?.pushing_note || "",
          pushing_status: p.fulfillment_active?.shipment?.pushing_status || "",
          delivery_service_name:
            p.fulfillment_active?.shipment?.delivery_service_provider_name || "",
          delivery_service_note: p.fulfillment_active?.shipment?.delivery_service_note || "",
          is_loading: false,
        };
      });

      setData(result);
    }
  }, [orderPushFalseDelivery]);

  return (
    <React.Fragment>
      <Modal
        className="packed-modal-confirm"
        title="Đơn đẩy sang hãng vận chuyển thất bại"
        centered
        visible={isVisible}
        footer={
          <React.Fragment>
            <Button type="default" onClick={() => setIsVisible && setIsVisible(false)}>
              Đóng
            </Button>
          </React.Fragment>
        }
        onCancel={() => setIsVisible && setIsVisible(false)}
        width={1000}
      >
        <Table
          pagination={false}
          dataSource={data}
          columns={[
            {
              title: "Mã đơn hàng",
              dataIndex: "order_code",
              width: 150,
              render: (value: any, record: orderPushFalseDeliveryTable) => (
                <Link to={`${UrlConfig.ORDER}/${record.order_id}`} target="_blank">
                  {value}
                </Link>
              ),
            },
            {
              title: "Mã đơn giao",
              dataIndex: "fulfillment_code",
              width: 150,
              render: (value: any, record: orderPushFalseDeliveryTable) => (
                <Link to={`${UrlConfig.ORDER}/${record.order_id}`} target="_blank">
                  {value}
                </Link>
              ),
            },
            {
              title: "Tình trạng",

              render: (value: any, record: orderPushFalseDeliveryTable, index: number) => {
                return (
                  <React.Fragment>
                    <ul style={{ color: "red" }}>
                      <li>{record.pushing_note}</li>
                      <li>{record.delivery_service_note}</li>
                    </ul>
                  </React.Fragment>
                );
              },
            },
            {
              title: "",
              width: 100,
              render: (value: any, record: orderPushFalseDeliveryTable, index: number) => (
                <Button
                  style={{ height: "30px" }}
                  type="primary"
                  loading={record.is_loading}
                  onClick={() => {
                    handlePushFulfillment(record.fulfillment_id);
                  }}
                >
                  Đẩy lại đơn
                </Button>
              ),
            },
            {
              title: "",
              width: 50,
              render: (value: any, record: orderPushFalseDeliveryTable, index: number) => (
                <Popconfirm
                  style={{ height: "20px" }}
                  onConfirm={() => {
                    handleRemoveFulfillment(record.fulfillment_id);
                  }}
                  title={"Bạn chắc chắn muốn xóa"}
                  okText="đồng ý"
                  cancelText="bỏ"
                  placement="leftTop"
                >
                  <Button
                    style={{ width: "30px", height: "30px", padding: 0 }}
                    icon={<CloseOutlined />}
                  />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </React.Fragment>
  );
};

export default PackConfirmModal;
