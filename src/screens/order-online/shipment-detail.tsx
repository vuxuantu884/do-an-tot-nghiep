/* eslint-disable @typescript-eslint/no-unused-vars */

import { Button, Card, Col, Collapse, Divider, Row, Table } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { getFulfillmentDetail, getTrackingLogFulfillmentAction, RePushFulFillmentAction, UpdateFulFillmentStatusAction } from "domain/actions/order/order.action";
import { OrderResponse, TrackingLogFulfillmentResponse } from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import doubleArrow from "assets/icon/double_arrow.svg";
import "./scss/shipment-detail.scss";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { FulFillmentStatus, ShipmentMethod } from "utils/Constants";
import { UpdateFulFillmentStatusRequest } from "model/request/order.request";
import { showSuccess } from "utils/ToastUtils";

type ShipmentParam = {
  code: string;
};

const ShipmentDetail: React.FC = () => {
  const dispatch = useDispatch();
  // const history = useHistory();

  let { code } = useParams<ShipmentParam>();

  // const [isError, setError] = useState<boolean>(false);
  const [fulfillmentDetail, setFulfillmentDetail] = useState<any>({});
  const [orderItems, setOrderItems] = useState([]);
  const [itemTotal, setItemTotal] = useState<any>({});
  const [trackingLogFulfillment, setTrackingLogFulfillment] =
    useState<Array<TrackingLogFulfillmentResponse> | null>(null);
  const status_order = [
    { name: "Chưa giao", value: "unshipped", color: "#2A2A86" },
    { name: "Đã lấy hàng", value: "picked", color: "#2A2A86" },
    { name: "Giao một phần", value: "partial", color: "#2A2A86" },
    { name: "Đã đóng gói", value: "packed", color: "#2A2A86" },
    { name: "Đang giao", value: "shipping", color: "#2A2A86" },
    { name: "Đã giao", value: "shipped", color: "#2A2A86" },
    { name: "Đang trả lại", value: "returning", color: "#E24343" },
    { name: "Đã trả lại", value: "returned", color: "#E24343" },
    { name: "Đã hủy", value: "cancelled", color: "#E24343" }
  ];
  const shipping_delivery_provider_type_name = useMemo(() => {
    switch (fulfillmentDetail.shipment?.delivery_service_provider_type) {
      case ShipmentMethod.EXTERNAL_SERVICE:
        return "Hãng vận chuyển";
      case ShipmentMethod.SHIPPER:
        return "Đối tác";
      case ShipmentMethod.PICK_AT_STORE:
        return "Nhận tại cửa hàng";
      default: return ""
    }
  }, [fulfillmentDetail.shipment?.delivery_service_provider_type]);

  const shipping_requirement = useMemo(() => {
    return [
      { name: "Cho xem và thử hàng", value: "open_try" },
      { name: "Cho xem, không thử hàng", value: "open_no_try" },
      { name: "Không cho xem hàng", value: "no_open" }
    ]
  }, []);
  const requirement = useMemo(() => {
    const findRequirement = shipping_requirement.find(item => item.value === fulfillmentDetail?.shipment?.requirements)
    return findRequirement ? findRequirement.name : ""
  }, [fulfillmentDetail?.shipment?.requirements, shipping_requirement]);
  const [columnsItems, setColumnsItems] = useState<Array<any>>([
    {
      title: "Tên sản phẩm",
      render: (record: any) => (
        <div>
          <div style={{ color: '#2A2A86' }}>{record.sku}</div>
          <div>{record.variant}</div>
        </div>
      ),
      visible: true,
      width: "35%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (quantity: number) => (
        <div>
          <NumberFormat
            value={quantity}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
          <div style={{ height: 40 }}></div>
        </div>
      ),
      visible: true,
      align: 'right',
      width: "15%",
    },
    {
      title: <span><span>Đơn giá </span><span style={{ color: '#737373', fontWeight: 400 }}> đ</span></span>,
      dataIndex: "price",
      render: (price: number) => (
        <div>
          <NumberFormat
            value={price}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
          <div style={{ height: 40 }}></div>
        </div>
      ),
      visible: true,
      align: 'right',
      width: "15%",
    },
    {
      title: "Chiết khấu",
      render: (record: any) => (
        <div>
          <NumberFormat
            value={record.discount_amount}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
          <div style={{ color: '#E24343', height: 40 }}>{record.discount_rate}%</div>
        </div>
      ),
      visible: true,
      align: 'right',
      width: "15%",
    },
    {
      title: <span><span>Thành tiền </span><span style={{ color: '#737373', fontWeight: 400 }}> đ</span></span>,
      render: (record: any) => (
        <div>
          <NumberFormat
            value={record.price * record.quantity - record.discount_amount}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
          <div style={{ height: 40 }}></div>
        </div>
      ),
      visible: true,
      align: 'right',
      width: "20%",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const onOKGoodsReturn = useCallback(() => {
    setLoading(true)
    let value: UpdateFulFillmentStatusRequest = {
      order_id: null,
      fulfillment_id: null,
      status: "",
    };
    value.order_id = fulfillmentDetail?.order.id;
    value.fulfillment_id = fulfillmentDetail.id;
    value.status = FulFillmentStatus.RETURNED;
    dispatch(UpdateFulFillmentStatusAction(value, () => {
      showSuccess(
        'Bạn đã nhận hàng trả lại'
      );
      setFulfillmentDetail({
        ...fulfillmentDetail,
        return_status: 'returned'
      });
      setLoading(false)
    }));
  }, [dispatch, fulfillmentDetail]);

  const [loading1, setLoading1] = useState(false);
  const rePush = useCallback(() => {
    setLoading1(true)
    const fulfillment_id = fulfillmentDetail.id;
    dispatch(RePushFulFillmentAction(fulfillment_id, () => {
      showSuccess(
        'Đẩy lại đơn hàng thành công'
      );
      setFulfillmentDetail({
        ...fulfillmentDetail,
        shipment: {
          ...fulfillmentDetail.shipment,
          pushing_status: 'success'
        }
      });
      setLoading1(false)
    }));
  }, [dispatch, fulfillmentDetail]);

  useEffect(() => {
    console.log('code code code', code);
    dispatch(
      getFulfillmentDetail(
        code,
        (data) => {
          console.log('data data', data);

          const status = status_order.find(
            (status) => status.value === data.status
          );
          const mapItems = data.order.items.map((item: any) => {
            let discount_amount = 0;
            let discount_rate = 0;
            item.discount_items.forEach((discount: any) => {
              discount_amount += discount.amount;
              discount_rate += discount.rate;
            })
            return {
              ...item,
              discount_amount,
              discount_rate
            }
          })
          let discount_amount = 0;
          let discount_rate = 0;
          data.order.discounts.forEach((discount: any) => {
            discount_amount += discount.amount;
            discount_rate += discount.rate;
          })

          let quantityTotal = 0;
          let amountTotal = 0;
          let discountTotal = 0;
          let afterDiscountTotal = 0;
          mapItems.forEach((item: any) => {
            quantityTotal += item.quantity;
            amountTotal += item.price * item.quantity;
            discountTotal += item.discount_amount;
          })

          afterDiscountTotal = amountTotal - discountTotal

          console.log('mapItems', mapItems);
          setOrderItems(mapItems);
          setItemTotal({
            quantityTotal,
            amountTotal,
            discountTotal,
            afterDiscountTotal
          })
          setFulfillmentDetail({
            ...data,
            status_name: status?.name,
            status_color: status?.color,
            discount_amount,
            discount_rate
          });
        }
      )
    );
    dispatch(
      getTrackingLogFulfillmentAction(
        code,
        setTrackingLogFulfillment
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, dispatch]);

  return (
    <ContentContainer
      title="Chi tiết đơn giao hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đơn giao hàng",
          path: UrlConfig.SHIPMENTS,
        },
        {
          name: code,
        },
      ]}
    >
      <Row gutter={20} className="fulfillment-detail">
        <Col md={16}>
          <Card
            title={
              <div className="title">
                <span><span>MÃ VẬN ĐƠN:</span><span style={{ color: '#2A2A86' }}> {fulfillmentDetail?.shipment?.tracking_code}</span></span>
                <span style={{ textTransform: 'initial' }}>
                  <span style={{ fontWeight: 400 }}>Trạng thái:</span>
                  <span style={{ color: fulfillmentDetail?.shipment?.pushing_status !== 'failed' ? fulfillmentDetail?.status_color : '#E24343', paddingLeft: 5 }}>
                      {fulfillmentDetail?.shipment?.pushing_status !== 'failed' ? fulfillmentDetail?.status_name : 'Đẩy đơn hvc thất bại'}
                  </span>
                </span>
                <span style={{ minWidth: 100 }}>
                  {fulfillmentDetail?.shipment?.pushing_status === 'failed' && <Button
                    type="primary"
                    onClick={() => rePush()}
                    loading={loading1}
                  >
                    Đẩy lại đơn HVC
                  </Button>}
                  {fulfillmentDetail?.return_status === 'returning' && <Button
                    type="primary"
                    onClick={() => onOKGoodsReturn()}
                    loading={loading}
                  >
                    Nhận hàng
                  </Button>}
                </span>
              </div>
            }
            className="fulfillment-info"
          >
            <div className="details">
              <div className="detail">
                <span className="name">Đơn hàng:</span>
                <span className="value" style={{ color: '#2A2A86' }}><b>{fulfillmentDetail?.order?.code}</b></span>
              </div>
              <div className="detail">
                <span className="name">Người nhận:</span>
                <span className="value">{fulfillmentDetail?.order?.shipping_address?.name}</span>
              </div>
              <div className="detail">
                <span className="name">Điện thoại:</span>
                <span className="value">{fulfillmentDetail?.order?.shipping_address?.phone}</span>
              </div>
              <div className="detail">
                <span className="name">Địa chỉ nhận hàng:</span>
                <span className="value">
                  {fulfillmentDetail?.order?.shipping_address?.full_address}
                </span>
              </div>
              <div className="detail">
                <span className="name">Quận/Huyện:</span>
                <span className="value">{fulfillmentDetail?.order?.shipping_address?.district}</span>
              </div>
              <div className="detail">
                <span className="name">Tỉnh/Thành:</span>
                <span className="value">{fulfillmentDetail?.order?.shipping_address?.city}</span>
              </div>
            </div>
            <div className="details">
              <div className="detail">
                <span className="name">Kho hàng:</span>
                <span className="value" style={{ color: '#2A2A86' }}><b>{fulfillmentDetail?.order?.store}</b></span>
              </div>
              <div className="detail">
                <span className="name">SĐT kho lấy hàng:</span>
                <span className="value">{fulfillmentDetail?.order?.store_phone_number}</span>
              </div>
              <div className="detail">
                <span className="name">Địa chỉ kho lấy hàng:</span>
                <span className="value">{fulfillmentDetail?.order?.store_full_address}</span>
              </div>
              <div className="detail">
                <span className="name">Hình thức giao hàng:</span>
                <span className="value">{shipping_delivery_provider_type_name}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày nhặt hàng:</span>
                <span className="value">{fulfillmentDetail?.picked_on ? ConvertUtcToLocalDate(fulfillmentDetail?.picked_on) : '-'}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày đóng gói:</span>
                <span className="value">{fulfillmentDetail?.packed_on ? ConvertUtcToLocalDate(fulfillmentDetail?.packed_on) : '-'}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày xuất kho:</span>
                <span className="value">{fulfillmentDetail?.export_on ? ConvertUtcToLocalDate(fulfillmentDetail?.export_on) : '-'}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày huỷ giao hàng:</span>
                <span className="value">{fulfillmentDetail?.cancel_date ? ConvertUtcToLocalDate(fulfillmentDetail?.cancel_date) : '-'}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày nhận hàng:</span>
                <span className="value">{fulfillmentDetail?.received_on ? ConvertUtcToLocalDate(fulfillmentDetail?.received_on) : '-'}</span>
              </div>
            </div>

          </Card>
          <Card title="THÔNG TIN SẢN PHẨM">

            <Table
              dataSource={orderItems}
              columns={columnsItems}
              pagination={false}
              style={{ width: '100%' }}
            />
            <Row style={{ justifyContent: 'end', width: '100%' }}>
              <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid #E5E5E5' }}>
                <span style={{ width: '35%', padding: 16, fontWeight: 700 }}>TỔNG</span>
                <span style={{ width: '15%', padding: 16 }}>
                  <span style={{ float: 'right' }}>
                    <NumberFormat
                      value={itemTotal.quantityTotal ? itemTotal.quantityTotal : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </span>
                </span>
                <span style={{ width: '15%', padding: 16 }}>
                  <span style={{ float: 'right' }}>
                    <NumberFormat
                      value={itemTotal.amountTotal ? itemTotal.amountTotal : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </span>
                </span>
                <span style={{ width: '15%', padding: 16 }}>
                  <span style={{ float: 'right' }}>
                    <NumberFormat
                      value={itemTotal.discountTotal ? itemTotal.discountTotal : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </span>
                </span>
                <span style={{ width: '20%', padding: 16, fontWeight: 700 }}>
                  <span style={{ float: 'right' }}>
                    <NumberFormat
                      value={itemTotal.afterDiscountTotal ? itemTotal.afterDiscountTotal : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </span>
                </span>
              </div>
              <div style={{ width: '50%', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px', marginTop: '20px' }}>
                  <div>Tổng tiền:</div>
                  <div>
                    <NumberFormat
                      value={fulfillmentDetail.total_line_amount_after_line_discount}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px' }}>
                  <div>Chiết khấu:</div>
                  <div>
                    <NumberFormat
                      value={fulfillmentDetail.discount_amount ? fulfillmentDetail.discount_amount : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                    {/* <br />
                    <span style={{ color: '#E24343' }}>{fulfillmentDetail.discount_rate} %</span> */}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px' }}>
                  <div>Mã giảm giá:</div>
                  <div>
                    <NumberFormat
                      value={0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px' }}>
                  <div>Phí ship báo khách:</div>
                  <div>
                    <NumberFormat
                      value={fulfillmentDetail?.shipment?.shipping_fee_informed_to_customer ? fulfillmentDetail.shipment.shipping_fee_informed_to_customer : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <Divider style={{ marginTop: 0 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px' }}>
                  <div style={{ fontWeight: 700 }}>Khách cần phải trả:</div>
                  <div style={{ color: "#2A2A86", fontSize: 18, fontWeight: 700 }}>
                    <NumberFormat
                      value={fulfillmentDetail?.order?.total ? fulfillmentDetail.order.total : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>

              </div>
            </Row>
          </Card>
          <Card title="Chi tiết trạng thái giao hàng">
            <Collapse
              className="orders-timeline"
              expandIcon={({ isActive }) => (
                <img
                  src={doubleArrow}
                  alt=""
                  style={{
                    transform: isActive
                      ? "rotate(0deg)"
                      : "rotate(270deg)",
                    float: "right",
                  }}
                />
              )}
              ghost
              defaultActiveKey={["0"]}
            >
              {trackingLogFulfillment?.map((item, index) => (
                <Collapse.Panel
                  className={`orders-timeline-custom orders-dot-status ${index === 0 ? "currentTimeline" : ""} ${item.status === "failed" ? "hasError" : ""}`}
                  header={
                    <React.Fragment>
                      <b
                        style={{
                          paddingLeft: "14px",
                          color: "#222222",
                        }}
                      >
                        {item.shipping_status ? item.shipping_status : item.partner_note}
                      </b>
                      <i
                        className="icon-dot"
                        style={{
                          fontSize: "4px",
                          margin: "10px 10px 10px 10px",
                          color: "#737373",
                          position: "relative",
                          top: -2,
                        }}
                      ></i>{" "}
                      <span style={{ color: "#737373" }}>
                        {moment(item.created_date).format(
                          "DD/MM/YYYY HH:mm"
                        )}
                      </span>
                    </React.Fragment>
                  }
                  key={index}
                  showArrow={false}
                ></Collapse.Panel>
              ))}
            </Collapse>
          </Card>
        </Col>
        <Col md={8}>
          <Card
            title="THÔNG TIN ĐƠN GIAO HÀNG"
            className="info"
          >
            <div className="detail">
              <span className="name">Hãng vận chuyển:</span>
              <span className="value">{fulfillmentDetail?.shipment?.delivery_service_provider_name}</span>
            </div>
            <div className="detail">
              <span className="name">Tiền thu hộ COD:</span>
              <span className="value">
                <NumberFormat
                  value={fulfillmentDetail?.shipment?.cod}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </span>
            </div>
            <div className="detail">
              <span className="name">Tiền trả HVC:</span>
              <span className="value">
                <NumberFormat
                  value={fulfillmentDetail?.shipment?.shipping_fee_paid_to_three_pls}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </span>
            </div>
            <div className="detail">
              <span className="name">Phí ship báo khách:</span>
              <span className="value">
                <NumberFormat
                  value={fulfillmentDetail?.shipment?.shipping_fee_informed_to_customer}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </span>
            </div>
            <div className="detail">
              <span className="name">Ngày tạo:</span>
              <span className="value">{fulfillmentDetail?.created_date ? ConvertUtcToLocalDate(fulfillmentDetail?.created_date) : '-'}</span>
            </div>
            <div className="detail">
              <span className="name">Hẹn giao:</span>
              <span className="value">{fulfillmentDetail?.shipment?.expected_received_date ? ConvertUtcToLocalDate(fulfillmentDetail?.shipment.expected_received_date) : '-'}</span>
            </div>
            <div className="detail">
              <span className="name">Giờ hành chính:</span>
              <span className="value">Có</span>
            </div>
            <div className="detail">
              <span className="name">Yêu cầu:</span>
              <span className="value">{requirement}</span>
            </div>
            {/* <div className="detail">
              <span className="name">Đối soát:</span>
              <span className="value"></span>
            </div> */}
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default ShipmentDetail;
