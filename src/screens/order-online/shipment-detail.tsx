/* eslint-disable @typescript-eslint/no-unused-vars */

import { Card, Col, Collapse, Divider, Row, Table } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { getFulfillmentDetail, getTrackingLogFulfillmentAction } from "domain/actions/order/order.action";
import { TrackingLogFulfillmentResponse } from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import doubleArrow from "assets/icon/double_arrow.svg";
import "./scss/shipment-detail.scss";

type ShipmentParam = {
  code: string;
};

const ShipmentDetail: React.FC = () => {
  const dispatch = useDispatch();
  // const history = useHistory();

  let { code } = useParams<ShipmentParam>();

  // const [isError, setError] = useState<boolean>(false);
  const [fulfillmentDetail, setFulfillmentDetail] = useState<any>({});
  const [trackingLogFulfillment, setTrackingLogFulfillment] =
    useState<Array<TrackingLogFulfillmentResponse> | null>(null);

  const [columnsItems, setColumnsItems]  = useState<Array<any>>([
    {
      title: "STT",
      dataIndex: "index",
      visible: true,
      width:"10%",
    },
    {
      title: "Tên sản phẩm",
      render: (record: any) => (
        <div>
          <div style={{ color: '#2A2A86'}}>{record.sku}</div>
          <div>{record.variant}</div>
        </div>
      ),
      visible: true,
      width: "40%",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      visible: true,
      align: 'center'
    },
    {
      title: <span><span>Đơn giá </span><span style={{color: '#737373', fontWeight: 400}}> đ</span></span>,
      dataIndex: "price",
      visible: true,
      align: 'right'
    },
    {
      title: <span><span>Thành tiền </span><span style={{color: '#737373', fontWeight: 400}}> đ</span></span>,
      render: (record: any) => (
        <NumberFormat
          value={record.price * record.quantity}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      visible: true,
      align: 'right'
    },
  ]);
  useEffect(() => {
    console.log('code code code', code);
    dispatch(
      getFulfillmentDetail(
        code,
        setFulfillmentDetail
      )
    );
    dispatch(
      getTrackingLogFulfillmentAction(
        code,
        setTrackingLogFulfillment
      )
    );
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
            title="Mã vận đơn"
            className="fulfillment-info"
          >
            <div className="details">
              <div className="detail">
                <span className="name">Đơn hàng:</span>
                <span className="value">{fulfillmentDetail?.order?.code}</span>
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
                <span className="value">{fulfillmentDetail?.order?.store}</span>
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
                <span className="value">{fulfillmentDetail?.order?.shipping_address?.city}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày nhặt hàng:</span>
                <span className="value">{fulfillmentDetail?.picked_on}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày đóng gói:</span>
                <span className="value">{fulfillmentDetail?.packed_on}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày xuất kho:</span>
                <span className="value">{fulfillmentDetail?.export_on}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày huỷ giao hàng:</span>
                <span className="value">{fulfillmentDetail?.cancel_date}</span>
              </div>
              <div className="detail">
                <span className="name">Ngày nhận hàng:</span>
                <span className="value">{fulfillmentDetail?.received_on}</span>
              </div>
            </div>

          </Card>
          <Card title="THÔNG TIN SẢN PHẨM">
          
            <Table
                dataSource={fulfillmentDetail?.items?.map((item: any, index: number) => {
                  return {
                    ...item,
                    index: index +1
                  }
                })}
                columns={columnsItems}
                pagination={false}
                style={{ width: '100%'}}
              />
            <Row gutter={16} style={{ justifyContent: 'end', width: '100%' }}>
              <div style={{ width: '50%'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px', marginTop: '20px'}}>
                  <div>Tổng tiền:</div>
                  <div style={{ color: "#2A2A86"}}>
                    <NumberFormat
                      value={fulfillmentDetail.total}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
                  <div>Chiết khấu:</div>
                  <div style={{ color: "#2A2A86" }}>
                    <NumberFormat
                      value={fulfillmentDetail.total_discount? fulfillmentDetail.total_discount : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
                  <div>Phí giao hàng:</div>
                  <div style={{ color: "#2A2A86" }}>
                    <NumberFormat
                      value={fulfillmentDetail?.shipment?.shipping_fee_informed_to_customer ? fulfillmentDetail.shipment.shipping_fee_informed_to_customer : 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
                <Divider style={{ marginTop: 0}}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', height: '40px'}}>
                  <div>COD:</div>
                  <div style={{ color: "#2A2A86"}}>
                    <NumberFormat
                      value={fulfillmentDetail?.shipment?.cod ? fulfillmentDetail.shipment.cod : 0}
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
              expandIcon={({isActive}) => (
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
                      <span style={{color: "#737373"}}>
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
              <span className="value">{fulfillmentDetail?.order?.store}</span>
            </div>
            <div className="detail">
              <span className="name">Tiền thu hộ COD:</span>
              <span className="value">{fulfillmentDetail?.order?.store_phone_number}</span>
            </div>
            <div className="detail">
              <span className="name">Tiền trả HVC/Đối tác:</span>
              <span className="value">{fulfillmentDetail?.order?.store_full_address}</span>
            </div>
            <div className="detail">
              <span className="name">Phí ship báo khách:</span>
              <span className="value">{fulfillmentDetail?.order?.shipping_address?.city}</span>
            </div>
            <div className="detail">
              <span className="name">Ngày tạo:</span>
              <span className="value">{fulfillmentDetail?.picked_on}</span>
            </div>
            <div className="detail">
              <span className="name">Hẹn giao:</span>
              <span className="value">{fulfillmentDetail?.packed_on}</span>
            </div>
            <div className="detail">
              <span className="name">Giờ hành chính:</span>
              <span className="value">Có</span>
            </div>
            <div className="detail">
              <span className="name">Yêu cầu:</span>
              <span className="value">{fulfillmentDetail?.cancel_date}</span>
            </div>
            <div className="detail">
              <span className="name">Đối soát:</span>
              <span className="value">{fulfillmentDetail?.received_on}</span>
            </div>
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default ShipmentDetail;
