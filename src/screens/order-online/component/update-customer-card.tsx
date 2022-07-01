//#region Import
import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import UrlConfig from "config/url.config";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { POS } from "utils/Constants";
import OrderBillRequestButton from "./order-detail/CardCustomer/OrderBillRequest/OrderBillRequestButton";
import OrderBillRequestDetailModal from "./order-detail/CardCustomer/OrderBillRequest/OrderBillRequestDetailModal";
//#endregion

type CustomerCardUpdateProps = {
  OrderDetail: OrderResponse | null;
  customerDetail: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
};

const UpdateCustomerCard: React.FC<CustomerCardUpdateProps> = (
  props: CustomerCardUpdateProps
) => {
  const { loyaltyPoint, loyaltyUsageRules } = props;
  
  let customerBirthday = moment(props.customerDetail?.birthday).format("DD/MM/YYYY");

  const [isVisibleOrderBillRequestDetailModal, setIsVisibleOrderBillRequestDetailModal] = useState(false);

	const renderFulfillmentShippingAddress = (OrderDetail: OrderResponse | null) => {
		let result = "";
		let shippingAddress = OrderDetail?.shipping_address;
		if(!shippingAddress) {
			return "";
		}
    const addressArr = [shippingAddress.name, shippingAddress.phone, shippingAddress.full_address, shippingAddress.ward, shippingAddress.district, shippingAddress.city];
    const addressArrResult = addressArr.filter(address => address);
    ///let second_phone_address=shippingAddress.second_phone?`-${shippingAddress.second_phone} -`:'-';
    if(addressArrResult.length > 0) {
      result = addressArrResult.join(" - ")
    }
		return result;
	};

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id ===
      (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

  const renderOrderSourceName = () => {
    let result = props.OrderDetail?.source;
    if(!props.OrderDetail?.source && props.OrderDetail?.source_id === POS.source_id) {
      result= POS.source_name
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
          <div className="d-flex align-items-center form-group-with-search" style={{flexDirection: "row"}}>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
              }}
            >
              <span style={{ marginRight: "5px" }}>Nguồn:</span>
              <span className="text-error">
                <span style={{ color: "red" }}>
                  {renderOrderSourceName()}
                </span>
              </span>
            </span>
            <span 
              style={{
                float: "left",
                lineHeight: "40px",
                margin: "0 10px"
              }}
            > - </span>
            <span
              style={{
                float: "left",
                lineHeight: "40px",
              }}
            >
              <span style={{ marginRight: "5px" }}>Kênh:</span>
              <span className="text-error">
                <span style={{ color: "red" }}>
                  {props.OrderDetail?.channel}
                </span>
              </span>
            </span>
          </div>
        }
      >
        <div>
          <Row align="middle" justify="space-between" className="row-customer-detail">
            <Space>
              <Avatar size={32}>A</Avatar>
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${props.customerDetail?.id}`}
              >
                {props.customerDetail?.full_name}
              </Link>
              <Tag className="orders-tag orders-tag-vip">
                <b>{!rankName ? "Không có hạng" : rankName}</b>
              </Tag>
            </Space>
            <Space className="customer-detail-phone">
              <span className="customer-detail-icon">
                <img src={callIcon} alt="" className="icon-customer-info" />
              </span>
              <Link to={`${UrlConfig.ORDER}?search_term=${props.customerDetail?.phone}`} className="customer-detail-text" target="_blank">{props.customerDetail?.phone}</Link>
            </Space>
  
            <Space className="customer-detail-point">
              <span className="customer-detail-icon">
                <img src={pointIcon} alt="" />
              </span>
              <span className="customer-detail-text">
                Tổng điểm:
                <Typography.Text
                  type="success"
                  style={{ color: "#FCAF17", marginLeft: "5px" }}
                  strong
                >
                  {loyaltyPoint?.point === undefined ? "0" : loyaltyPoint?.point}
                </Typography.Text>
              </span>
            </Space>
  
            <Space className="customer-detail-birthday">
              <span className="customer-detail-icon">
                <img src={birthdayIcon} alt="" />
              </span>
              <span className="customer-detail-text">
                {props.customerDetail?.birthday !== null
                  ? customerBirthday
                  : "Không xác định"}
              </span>
            </Space>
          </Row>
          {props.OrderDetail?.shipping_address && (
            <>
              <Divider style={{ padding: 0, marginBottom: 0 }} />
              <div>
                <Row gutter={24} style={{paddingTop: "14px"}}>
                  <Col
                    xs={props.OrderDetail?.bill?.id ? 16 : 24}
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
                  {props.OrderDetail?.bill?.id ? (
                    <Col xs={8}>
                      <OrderBillRequestButton 
                        handleClickOrderBillRequestButton={() => setIsVisibleOrderBillRequestDetailModal(true)} 
                        orderDetail={props.OrderDetail} 
                      />
                    </Col>
                  ) :null}
                </Row>
  
                <Row gutter={24} hidden={props.OrderDetail?.shipping_address?.second_phone?false:true}>
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
              </div>
            </>
          )}
        </div>
      </Card>
      <OrderBillRequestDetailModal
        isVisibleOrderBillRequestDetailModal={isVisibleOrderBillRequestDetailModal}
        handleCancel={() =>{setIsVisibleOrderBillRequestDetailModal(false)}}
        handleOk={() =>{setIsVisibleOrderBillRequestDetailModal(false)}}
        orderDetail = {props.OrderDetail}
      />
    </React.Fragment>
  );
};

export default UpdateCustomerCard;
