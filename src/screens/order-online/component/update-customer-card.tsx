//#region Import
import {
    Button,
    Card,
    Row,
    Col,
    Space,
    Typography,
    Popover,
    Divider,
    Checkbox,
    Avatar,
    Tag,
} from "antd";
import {
  OrderResponse,
} from "model/response/order/order.response";
import AddAddressModal from "../modal/AddAddressModal";
import EditCustomerModal from "../modal/EditCustomerModal";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import noteCustomer from "assets/img/note-customer.svg";
import callIcon from "assets/img/call.svg";
import { Link } from "react-router-dom";
import moment from "moment";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useCallback, useState } from "react";
//#endregion

type CustomerCardUpdateProps = {
  OrderDetail: OrderResponse | null;
  customerDetail: CustomerResponse | null;
};

const UpdateCustomerCard: React.FC<CustomerCardUpdateProps> = (
  props: CustomerCardUpdateProps
) => {
  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const CancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const CancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);
  const ShowAddressModal = () => {
    setVisibleAddress(true);
    setVisibleShippingAddress(false);
    setVisibleBillingAddress(false);
  };
  
  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };

  const handleVisibleBillingAddressChange = (value: boolean) => {
    setVisibleBillingAddress(value);
  };
  let customerBirthday = moment(props.customerDetail?.birthday).format("DD/MM/YYYY");
  return (
    <Card
      className="card-block card-block-customer"
      title={
        <div className="d-flex">
          <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
        </div>
      }
      extra={
        <div className="d-flex align-items-center form-group-with-search">
          <span
            style={{
              float: "left",
              lineHeight: "40px",
            }}
          >
            <span style={{ marginRight: "10px" }}>Nguồn:</span>
            <span className="text-error">
              <span style={{ color: "red" }}>{props.OrderDetail?.source}</span>
            </span>
          </span>
        </div>
      }
    >
      <div>
        <Row
          align="middle"
          justify="space-between"
          className="row-customer-detail padding-custom"
        >
          <Space>
            <Avatar size={32}>A</Avatar>
            <Link to="#">{props.customerDetail?.full_name}</Link>
            <Tag className="orders-tag orders-tag-vip">
              <b>{props.customerDetail?.customer_level}</b>
            </Tag>
          </Space>
          <Space className="customer-detail-phone">
            <span className="customer-detail-icon">
              <img src={callIcon} alt="" className="icon-customer-info" />
            </span>
            <span className="customer-detail-text">
              {props.customerDetail?.phone}
            </span>
          </Space>

          <Space className="customer-detail-point">
            <span className="customer-detail-icon">
              <img src={pointIcon} alt="" />
            </span>
            <span className="customer-detail-text">
              Tổng điểm{" "}
              <Typography.Text
                type="success"
                style={{ color: "#0080FF" }}
                strong
              >
                {props.customerDetail?.loyalty === undefined
                  ? "0"
                  : props.customerDetail?.loyalty}
              </Typography.Text>
            </span>
          </Space>

          <Space className="customer-detail-birthday">
            <span className="customer-detail-icon">
              <img src={bithdayIcon} alt="" />
            </span>
            <span className="customer-detail-text">{customerBirthday}</span>
          </Space>
        </Row>
        <Divider className="margin-0" style={{ padding: 0, marginBottom: 0 }} />
        <div className="padding-lef-right">
          <Row gutter={24}>
            <Col
              xs={24}
              lg={12}
              style={{
                borderRight: "1px solid #E5E5E5",
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
                Địa chỉ giao hàng:
              </div>
              <Row className="customer-row-info">
                <span>{props.OrderDetail?.shipping_address?.name}</span>
              </Row>
              <Row className="customer-row-info">
                <span>{props.OrderDetail?.shipping_address?.phone}</span>
              </Row>
              <Row className="customer-row-info">
                <span>{props.OrderDetail?.shipping_address?.full_address}</span>
              </Row>
              <Row>
                <Popover
                  placement="bottomLeft"
                  title={
                    <Row
                      justify="space-between"
                      align="middle"
                      className="change-shipping-address-title"
                    >
                      <div style={{ color: "#4F687D" }}>Thay đổi địa chỉ</div>
                      <Button type="link" onClick={ShowAddressModal}>
                        Thêm địa chỉ mới
                      </Button>
                    </Row>
                  }
                  content={
                    <div className="change-shipping-address-content">
                      <div className="shipping-address-row">
                        <div className="shipping-address-name">
                          Địa chỉ 1{" "}
                          <Button
                            type="text"
                            onClick={ShowAddressModal}
                            className="p-0"
                          >
                            <img src={editBlueIcon} alt="" />
                          </Button>
                        </div>
                        <div className="shipping-customer-name">Do Van A</div>
                        <div className="shipping-customer-mobile">
                          0987654321
                        </div>
                        <div className="shipping-customer-address">Ha Noi</div>
                      </div>
                    </div>
                  }
                  trigger="click"
                  visible={visibleShippingAddress}
                  onVisibleChange={handleVisibleBillingAddressChange}
                  className="change-shipping-address"
                >
                  <Button type="link" className="btn-style">
                    Thay đổi địa chỉ giao hàng
                  </Button>
                </Popover>
              </Row>
            </Col>
            <Col
              xs={24}
              lg={12}
              style={{ paddingLeft: "34px", marginTop: "14px" }}
            >
              <div className="form-group form-group-with-search">
                <div>
                  <label className="title-address">
                    <img
                      src={noteCustomer}
                      alt=""
                      style={{
                        width: "20px",
                        height: "20px",
                        marginRight: "10px",
                      }}
                    />
                    Ghi chú của khách:
                  </label>
                </div>
                <span style={{ marginTop: "10px" }}>
                  {props.OrderDetail?.customer_note !== ""
                    ? props.OrderDetail?.customer_note
                    : "Không có ghi chú"}
                </span>
              </div>
            </Col>
          </Row>
          <Divider style={{ padding: 0, margin: 0 }} />

          <div className="send-order-box">
            <Row style={{ marginTop: 15 }}>
              <Checkbox
                className="checkbox-style"
                onChange={ShowBillingAddress}
                style={{ marginLeft: "3px" }}
              >
                Gửi hoá đơn
              </Checkbox>
            </Row>

            <Row gutter={24} hidden={isVisibleBilling}>
              <Col
                xs={24}
                lg={12}
                style={{
                  borderRight: "1px solid #E5E5E5",
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
                </div>
                <Row className="customer-row-info">
                  <span>{props.OrderDetail?.billing_address?.name}</span>
                </Row>
                <Row className="customer-row-info">
                  <span>{props.OrderDetail?.billing_address?.phone}</span>
                </Row>
                <Row className="customer-row-info">
                  <span>{props.OrderDetail?.billing_address?.full_address}</span>
                </Row>
                <Row>
                  <Popover
                    placement="bottomLeft"
                    title={
                      <Row
                        justify="space-between"
                        align="middle"
                        className="change-shipping-address-title"
                      >
                        <div style={{ color: "#4F687D" }}>Thay đổi địa chỉ</div>
                        <Button type="link" onClick={ShowAddressModal}>
                          Thêm địa chỉ mới
                        </Button>
                      </Row>
                    }
                    content={
                      <div className="change-shipping-address-content">
                        <div className="shipping-address-row">
                          <div className="shipping-address-name">
                            Địa chỉ 1{" "}
                            <Button
                              type="text"
                              onClick={ShowAddressModal}
                              className="p-0"
                            >
                              <img src={editBlueIcon} alt="" />
                            </Button>
                          </div>
                          <div className="shipping-customer-name">Do Van A</div>
                          <div className="shipping-customer-mobile">
                            0987654321
                          </div>
                          <div className="shipping-customer-address">
                            Ha Noi
                          </div>
                        </div>
                      </div>
                    }
                    trigger="click"
                    visible={visibleBillingAddress}
                    onVisibleChange={handleVisibleBillingAddressChange}
                    className="change-shipping-address"
                  >
                    <Button type="link" className="btn-style">
                      Thay đổi địa chỉ gửi hóa đơn
                    </Button>
                  </Popover>
                </Row>
              </Col>
              <Col xs={24} lg={12} className="font-weight-500">
                <div className="form-group form-group-with-search">
                  <div>
                    <label htmlFor="" className="">
                      Email hoá đơn đến
                    </label>
                  </div>
                  <span>{props.OrderDetail?.billing_address?.email}</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <AddAddressModal
        visible={isVisibleAddress}
        onCancel={CancleConfirmAddress}
        onOk={OkConfirmAddress}
      />
      <EditCustomerModal
        visible={isVisibleCustomer}
        onCancel={CancleConfirmCustomer}
        onOk={OkConfirmCustomer}
      />
    </Card>
  );
};

export default UpdateCustomerCard;
