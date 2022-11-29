//#region Import
import { Avatar, Card, Col, Divider, Row, Space, Tag, Typography } from "antd";
import birthdayIcon from "assets/img/bithday.svg";
import userIcon from "assets/img/user.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import UrlConfig from "config/url.config";
import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
//#endregion

type CustomerCardUpdateProps = {
  customerDetail: any;
};

const InfoCustomer: React.FC<CustomerCardUpdateProps> = (props: CustomerCardUpdateProps) => {
  const { customerDetail } = props;
  let customerBirthday = moment(customerDetail?.birthday).format("DD/MM/YYYY");

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
              <span style={{ marginRight: "5px" }}>Trạng thái sử dụng:</span>
              {!!customerDetail?.status && (
                <span className="text-error">
                  <span
                    style={{ color: `${customerDetail?.status === "active" ? "green" : "red"}` }}
                  >
                    {customerDetail?.status === "active" ? "Hoạt động" : "Ngừng sử dụng"}
                  </span>
                </span>
              )}
            </span>
          </div>
        }
      >
        {!!customerDetail ? (
          <div>
            <Row align="middle" className="row-customer-detail">
              <Space style={{ width: "35%" }}>
                <Avatar size={32}>{customerDetail?.full_name[0]}</Avatar>
                <Link target="_blank" to={`${UrlConfig.CUSTOMER}/${customerDetail?.id}`}>
                  {customerDetail?.full_name}
                </Link>
                {customerDetail?.customer_level && (
                  <Tag className="orders-tag orders-tag-vip">
                    <b>{customerDetail?.customer_level}</b>
                  </Tag>
                )}
              </Space>
              <Space style={{ width: "20%" }} className="customer-detail-birthday nn">
                <span className="customer-detail-icon">
                  <img src={birthdayIcon} alt="" />
                </span>
                <span className="customer-detail-text">
                  {customerDetail?.birthday !== null ? customerBirthday : "Không xác định"}
                </span>
              </Space>
              <Space style={{ width: "20%" }} className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" className="icon-customer-info" />
                </span>
                <Link
                  to={`${UrlConfig.ORDER}?search_term=${customerDetail?.phone}`}
                  className="customer-detail-text"
                  target="_blank"
                  style={{ color: "#11006F" }}
                >
                  {customerDetail?.phone}
                </Link>
              </Space>

              <Space style={{ width: "25%" }} className="customer-detail-point">
                <span className="customer-detail-text">
                  Mã thẻ:
                  <Typography.Text style={{ marginLeft: "5px" }}>
                    {customerDetail?.card_number !== null
                      ? customerDetail?.card_number
                      : "không xác định"}
                  </Typography.Text>
                </span>
              </Space>
            </Row>
            <Row align="middle" className="row-customer-detail">
              <Space
                style={{ width: "35%", paddingLeft: "40px" }}
                className="customer-detail-point"
              >
                <span className="customer-detail-text">
                  Mã khách hàng:
                  <Typography.Text style={{ marginLeft: "5px" }}>
                    {customerDetail?.code}
                  </Typography.Text>
                </span>
              </Space>
              <Space style={{ width: "20%" }} className="customer-detail-birthday nn">
                <span className="customer-detail-icon">
                  <img src={userIcon} alt="" />
                </span>
                <span className="customer-detail-text">
                  {customerDetail?.gender === "male" ? "nam" : "nữ"}
                </span>
              </Space>
              <Space style={{ width: "20%", color: "#71767B" }} className="customer-detail-point">
                <span className="customer-detail-text">
                  Email:
                  <Typography.Text type="success" style={{ marginLeft: "5px", color: "#222222" }}>
                    {customerDetail?.email}
                  </Typography.Text>
                </span>
              </Space>
              <Space style={{ width: "25%" }} className="customer-detail-point">
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
                    {customerDetail?.point}
                  </Typography.Text>
                </span>
              </Space>
            </Row>
            {!!customerDetail?.shipping_addresses && (
              <>
                <Divider style={{ padding: 0, marginBottom: 0 }} />
                <div>
                  <Row gutter={24} style={{ paddingTop: "20px" }}>
                    <Col className="font-weight-500 customer-info-left">
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
                          {customerDetail?.shipping_addresses.length > 0 &&
                            customerDetail?.shipping_addresses.map((item: any) => {
                              if (item.default) {
                                return `${item.full_address ? item.full_address : ""}${
                                  item.ward ? " - " + item.ward : ""
                                }${item.district ? " - " + item.district : ""}${
                                  item.city ? " - " + item.city : ""
                                }`;
                              } else {
                                return null;
                              }
                            })}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>Không có thông tin khách hàng</div>
        )}
      </Card>
    </React.Fragment>
  );
};

export default InfoCustomer;
