import {
  Button,
  Card,
  Divider,
  Checkbox,
  Input,
  Row,
  Col,
  AutoComplete,
  Space,
  Typography,
  Popover,
  Form,
  Select,
} from "antd";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import peopleIcon2 from "assets/img/people.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import deleteRedIcon from "assets/img/deleteRed.svg";
import pointIcon from "assets/img/point.svg";
import plusBlueIcon from "assets/img/plus-blue.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import { SearchOutlined } from "@ant-design/icons";
import AddAddressModal from "./addAddressModal";
import EditCustomerModal from "./editCustomerModal";
import { SourceModel } from "model/other/SourceModel";
import { getListSourceRequest } from "domain/actions/orderOnline.action";

type CustomerCardProps = {
  // visible: boolean;
  // onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  // onOk: () => void;
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const dispatch = useDispatch();

  const showAddressModal = () => {
    setVisibleAddress(true);
  };
  const onCancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);
  const onOkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const showCustomerModal = () => {
    setVisibleCustomer(true);
  };
  const onCancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);
  const onOkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const showBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };

  const [listSource, setListSource] = useState<Array<SourceModel>>([]);

  useLayoutEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  return (
    <Card
      className="card-block card-block-customer"
      title={
        <div className="d-flex">
          <img src={peopleIcon2} alt="" /> Khách hàng
        </div>
      }
      extra={
        <div className="d-flex align-items-center form-group-with-search">
          {/* <label htmlFor="" className="required-label">
            Nguồn
          </label> */}
          <Form.Item name="source" label="Nguồn" style={{margin: "10px 0px"}}  rules={[{required: true}]}>
            <Select
              className="select-with-search"
              showSearch
              style={{ width: "200px" }}
              placeholder=""
              defaultValue=""
            >
              <Select.Option value="">Chọn nguồn đơn hàng</Select.Option>
              {listSource.map((item, index) => (
                <Select.Option
                  style={{ width: "100%" }}
                  key={index}
                  value={item.id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      }
    >
      <div className="form-group form-group-with-search form-search-customer">
        <label htmlFor="" className="">
          Tên khách hàng
        </label>
        <div>
          <AutoComplete>
            <Input.Search
              placeholder="Tìm hoặc thêm khách hàng"
              enterButton={
                <Button type="text">
                  <img src={plusBlueIcon} alt="" />
                </Button>
              }
              prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              onSearch={() => console.log(1)}
            />
          </AutoComplete>
        </div>
      </div>

      <Row
        align="middle"
        justify="space-between"
        className="row-customer-detail"
      >
        <Row align="middle" className="customer-detail-name">
          <Space>
            <span className="cdn-avatar">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {" "}
                <circle
                  opacity="0.2"
                  cx="16"
                  cy="16"
                  r="16"
                  fill="#6966FF"
                />{" "}
                <path
                  d="M12.853 22L13.8132 19.1307H18.1882L19.1541 22H21.4041L17.3018 10.3636H14.6996L10.603 22H12.853ZM14.3814 17.4375L15.9553 12.75H16.0462L17.62 17.4375H14.3814Z"
                  fill="#6C449F"
                />{" "}
              </svg>
            </span>
            <span>Đỗ Nguyệt Anh</span>
            <span className="cdn-level">VIP D</span>
          </Space>
        </Row>

        <Space className="customer-detail-phone">
          <span className="customer-detail-icon">
            <img src={callIcon} alt="" />
          </span>
          <span className="customer-detail-text">0986868686</span>
        </Space>

        <Space className="customer-detail-point">
          <span className="customer-detail-icon">
            <img src={pointIcon} alt="" />
          </span>
          <span className="customer-detail-text">
            Tổng điểm{" "}
            <Typography.Text type="success" strong>
              1230
            </Typography.Text>
          </span>
        </Space>

        <Space className="customer-detail-birthday">
          <span className="customer-detail-icon">
            <img src={bithdayIcon} alt="" />
          </span>
          <span className="customer-detail-text">25/04/1994</span>
        </Space>

        <Space className="customer-detail-action">
          <Button type="text" className="p-0" onClick={showCustomerModal}>
            <img src={editBlueIcon} alt="" />
          </Button>
          <Button type="text" className="p-0">
            <img src={deleteRedIcon} alt="" />
          </Button>
        </Space>
      </Row>

      <Divider />

      <div className="customer-info">
        <Row gutter={24}>
          <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
            <div>Địa chỉ giao hàng</div>
            <Row className="row-info customer-row-info">
              <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
              <span style={{ marginLeft: 9 }}>Na</span>
            </Row>
            <Row className="row-info customer-row-info">
              <img src={callIcon} alt="" /> <span>0986868686</span>
            </Row>
            <Row className="row-info customer-row-info">
              <img src={locationIcon} alt="" />{" "}
              <span>YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</span>
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
                    <Button type="link" onClick={showAddressModal}>
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
                          onClick={showAddressModal}
                          className="p-0"
                        >
                          <img src={editBlueIcon} alt="" />
                        </Button>
                      </div>
                      <div className="shipping-customer-name">
                        Nguyệt Anh String
                      </div>
                      <div className="shipping-customer-mobile">0986868686</div>
                      <div className="shipping-customer-address">
                        YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                      </div>
                    </div>

                    <div className="shipping-address-row">
                      <div className="shipping-address-name">
                        Địa chỉ 2{" "}
                        <Button
                          type="text"
                          onClick={showAddressModal}
                          className="p-0"
                        >
                          <img src={editBlueIcon} alt="" />
                        </Button>
                      </div>
                      <div className="shipping-customer-name">
                        Nguyệt Anh String
                      </div>
                      <div className="shipping-customer-mobile">0986868686</div>
                      <div className="shipping-customer-address">
                        YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                      </div>
                    </div>
                  </div>
                }
                className="change-shipping-address"
              >
                <Button type="link" className="p-0 m-0">
                  Thay đổi địa chỉ giao hàng
                </Button>
              </Popover>
            </Row>
          </Col>
          <Col xs={24} lg={12} className="font-weight-500">
            <div className="form-group form-group-with-search">
              <div>
                <label htmlFor="" className="">
                  Ghi chú của khách hàng
                </label>
              </div>
              <Input.TextArea placeholder="Điền ghi chú" rows={4} />
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="send-order-box">
          <Row style={{ marginBottom: 15 }}>
            <Checkbox className="checkbox-style" onChange={showBillingAddress}>
              Gửi hoá đơn
            </Checkbox>
          </Row>
          <Row gutter={24} hidden={true}>
            <Col xs={24} lg={12} className="font-weight-500 customer-info-left">
              <div>Địa chỉ gửi hoá đơn</div>
              <Row className="row-info customer-row-info">
                <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                <span style={{ marginLeft: 9 }}>Na</span>
              </Row>
              <Row className="row-info customer-row-info">
                <img src={callIcon} alt="" /> <span>0986868686</span>
              </Row>
              <Row className="row-info customer-row-info">
                <img src={locationIcon} alt="" />{" "}
                <span>YODY hub, Dưới chân cầu An Định, Tp. Hải Dương</span>
              </Row>
              <Row>
                <Button type="link" className="p-0 m-0">
                  Thay đổi địa chỉ gửi hoá đơn
                </Button>
              </Row>
            </Col>
            <Col xs={24} lg={12} className="font-weight-500">
              <div className="form-group form-group-with-search">
                <div>
                  <label htmlFor="" className="">
                    Email hoá đơn đến
                  </label>
                </div>
                <Input placeholder="Nhập email hoá đơn đến" />
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <AddAddressModal
        visible={isVisibleAddress}
        onCancel={onCancleConfirmAddress}
        onOk={onOkConfirmAddress}
      />
      <EditCustomerModal
        visible={isVisibleCustomer}
        onCancel={onCancleConfirmCustomer}
        onOk={onOkConfirmCustomer}
      />
    </Card>
  );
};

export default CustomerCard;
