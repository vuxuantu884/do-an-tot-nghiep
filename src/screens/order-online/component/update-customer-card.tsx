//#region Import
import { PhoneOutlined } from "@ant-design/icons";
import {Card, Col, Divider, Row } from "antd";
import addressIcon from "assets/img/user-pin.svg";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse } from "model/response/order/order.response";
import React, { useState } from "react";
import { POS } from "utils/Constants";
import { dangerColor, textBodyColor } from "utils/global-styles/variables";
import InfoCustomer from "./CardCustomer/InfoCustomer";
import OrderBillRequestButton from "./OrderBillRequest/OrderBillRequestButton";
import OrderBillRequestDetailModal from "./OrderBillRequest/OrderBillRequestDetailModal";

//#endregion

type CustomerCardUpdateProps = {
  OrderDetail: OrderResponse | null;
  customerDetail: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
};

const UpdateCustomerCard: React.FC<CustomerCardUpdateProps> = (props: CustomerCardUpdateProps) => {
  const { loyaltyPoint, loyaltyUsageRules } = props;

  const [isVisibleOrderBillRequestDetailModal, setIsVisibleOrderBillRequestDetailModal] =
    useState(false);

  const renderFulfillmentShippingAddress = (OrderDetail: OrderResponse | null) => {
    let result = "";
    let shippingAddress = OrderDetail?.shipping_address;
    if (!shippingAddress) {
      return "";
    }
    const addressArr = [
      shippingAddress.name,
      shippingAddress.phone,
      shippingAddress.full_address,
      shippingAddress.ward,
      shippingAddress.district,
      shippingAddress.city,
    ];
    const addressArrResult = addressArr.filter((address) => address);
    ///let second_phone_address=shippingAddress.second_phone?`-${shippingAddress.second_phone} -`:'-';
    if (addressArrResult.length > 0) {
      result = addressArrResult.join(" - ");
    }
    return result;
  };

  const renderOrderSourceName = () => {
    let result = props.OrderDetail?.source;
    if (!props.OrderDetail?.source && props.OrderDetail?.source_id === POS.source_id) {
      result = POS.source_name;
    }
    return result;
  };

  return (
    <React.Fragment>
      <Card
        className="card-block card-block-customer"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
          </div>
        }
        extra={
          <div
            className="d-flex align-items-center form-group-with-search"
            style={{ flexDirection: "row" }}
          >
            <span
              style={{
                float: "left",
                lineHeight: "40px",
              }}
            >
              <span style={{ marginRight: "5px" }}>Nguồn:</span>
              <span className="text-error">
                <span style={{ color: "red" }}>{renderOrderSourceName()}</span>
              </span>
            </span>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
                margin: "0 10px",
              }}
            >
              {" "}
              -{" "}
            </span>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
              }}
            >
              <span style={{ marginRight: "5px" }}>Kênh:</span>
              <span className="text-error">
                <span style={{ color: "red" }}>{props.OrderDetail?.channel}</span>
              </span>
            </span>
          </div>
        }
      >
      {props.customerDetail && (
        <InfoCustomer
          customer={props.customerDetail}
          loyaltyPoint= {loyaltyPoint}
          loyaltyUsageRules={loyaltyUsageRules}
        />
      )}
      
      {props.OrderDetail?.shipping_address && (
        <>
          <Row gutter={24} style={{ paddingTop: "14px" }}>
            <Col
              xs={props.OrderDetail?.billing_address?.order_id ? 16 : 24}
              className="font-weight-500 customer-info-left"
            >
              <div className="title-address 66">
                <img
                  src={addressIcon}
                  alt=""
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "10px",
                  }}
                />
                Địa chỉ giao hàng:
                <span style={{ fontWeight: 400, marginLeft: "10px" }}>
                  {renderFulfillmentShippingAddress(props.OrderDetail)}
                </span>
              </div>
            </Col>
            {props.OrderDetail?.billing_address?.order_id ? (
              <Col xs={8}>
                <OrderBillRequestButton
                  handleClickOrderBillRequestButton={() => {
                    setIsVisibleOrderBillRequestDetailModal(true);
                  }}
                  orderDetail={props.OrderDetail}
                  color={props.OrderDetail ? dangerColor : textBodyColor}
                />
              </Col>
            ) : null}
          </Row>

          <Row
            gutter={24}
            hidden={props.OrderDetail?.shipping_address?.second_phone ? false : true}
          >
            <Col
                    xs={24}
                    style={{
                      paddingTop: "14px",
                    }}
                    className="font-weight-500 customer-info-left"
                  >
                    <div className="title-address">
                      {/* <img
                        src={addressIcon}
                        alt=""
                        style={{
                          width: "24px",
                          height: "24px",
                          marginRight: "10px",
                        }}
                      /> */}
                      <PhoneOutlined
                        style={{
                          width: "24px",
                          height: "24px",
                          marginRight: "10px",
                        }}
                      />
                      Số điện thoại phụ:
                      <span style={{ fontWeight: 400, marginLeft: "10px" }}>
                        {/* {props.OrderDetail?.shipping_address?.name} - {" "} */}
                        {props.OrderDetail?.shipping_address?.second_phone}
                      </span>
                    </div>
            </Col>
          </Row>

          <div className="send-order-box" hidden={true}>
                  <Divider style={{ padding: 0, margin: 0 }} />
                  <Row gutter={24}>
                    <Col
                      xs={24}
                      style={{
                        paddingTop: "14px",
                      }}
                      className="font-weight-500 customer-info-left"
                    >
                      <div className="title-address">
                        <img
                          src={addressIcon}
                          alt=""
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "10px",
                          }}
                        />
                        Địa chỉ nhận hóa đơn:
                        <span style={{ fontWeight: 400, marginLeft: "10px" }}>
                          {props.OrderDetail?.billing_address?.name} -{" "}
                          {props.OrderDetail?.billing_address?.phone} -{" "}
                          {props.OrderDetail?.billing_address?.full_address} -{" "}
                          {props.OrderDetail?.billing_address?.ward} -{" "}
                          {props.OrderDetail?.billing_address?.district} -{" "}
                          {props.OrderDetail?.billing_address?.city}
                        </span>
                      </div>
                    </Col>
                  </Row>
          </div>
        </>
      )}
      </Card>
      <OrderBillRequestDetailModal
        isVisibleOrderBillRequestDetailModal={isVisibleOrderBillRequestDetailModal}
        handleCancel={() => {
          setIsVisibleOrderBillRequestDetailModal(false);
        }}
        handleOk={() => {
          setIsVisibleOrderBillRequestDetailModal(false);
        }}
        orderDetail={props.OrderDetail}
      />
    </React.Fragment>
  );
};

export default UpdateCustomerCard;
