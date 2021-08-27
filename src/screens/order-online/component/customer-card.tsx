/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
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
  Tag,
  Avatar,
} from "antd";
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import birthdayIcon from "assets/img/bithday.svg";
import addIcon from "assets/img/plus_1.svg";
import pointIcon from "assets/img/point.svg";
import callIcon from "assets/img/call.svg";
import imgDefault from "assets/icon/img-default.svg";
import editBlueIcon from "assets/img/edit_icon.svg";
import addressIcon from "assets/img/user-pin.svg";
import noteCustomer from "assets/img/note-customer.svg";
import { SearchOutlined } from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import AddAddressModal from "../modal/add-address.modal";
import EditCustomerModal from "../modal/edit-customer.modal";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { RefSelectProps } from "antd/lib/select";
import { CloseOutlined } from "@ant-design/icons";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { CustomerSearchQuery } from "model/query/customer.query";
//#end region

type CustomerCardProps = {
  InfoCustomerSet: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  customerParent?: CustomerResponse | null;
};

//Add query for search Customer
const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  gender: null,
  from_birthday: null,
  to_birthday: null,
  company: null,
  from_wedding_date: null,
  to_wedding_date: null,
  customer_type_id: null,
  customer_group_id: null,
  customer_level_id: null,
  responsible_staff_code: null,
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  //State
  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = createRef<RefSelectProps>();

  if (props.customerParent) {
    setCustomer(props.customerParent);
  }

  console.log("customer", customer);
  //#region Modal
  const ShowAddressModal = () => {
    setVisibleAddress(true);
  };

  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const ShowCustomerModal = () => {
    setVisibleCustomer(true);
  };

  const CancelConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  //#end region

  //#region Search and Render result
  //Search and render customer by name, phone, code
  const CustomerChangeSearch = useCallback(
    (value) => {
      console.log("value", value);
      setKeySearchCustomer(value);
      initQueryCustomer.request = value;
      dispatch(CustomerSearch(initQueryCustomer, setResultSearch));
    },
    [dispatch, initQueryCustomer]
  );

  //Render result search
  const CustomerRenderSearchResult = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100" style={{ lineHeight: "35px" }}>
          <img
            src={imgDefault}
            alt="anh"
            placeholder={imgDefault}
            className="logo-customer"
          />
          <div className="rs-info w-100">
            <span style={{ display: "flex" }}>
              {item.full_name}{" "}
              <i
                className="icon-dot"
                style={{
                  fontSize: "4px",
                  margin: "16px 10px 10px 10px",
                  color: "#737373",
                }}
              ></i>{" "}
              <span style={{ color: "#737373" }}>{item.phone}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomerConvertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.forEach((item: CustomerResponse, index: number) => {
      options.push({
        label: CustomerRenderSearchResult(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [dispatch, resultSearch]);

  //Delete customer
  const CustomerDeleteInfo = () => {
    setCustomer(null);
    props.InfoCustomerSet(null);
  };

  //#end region

  const SearchCustomerSelect = useCallback(
    (value, o) => {
      let index: number = -1;
      index = resultSearch.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        setCustomer(resultSearch[index]);
        props.InfoCustomerSet(resultSearch[index]);

        //set Shipping Address
        if (resultSearch[index].shipping_addresses) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setShippingAddress(item);
              props.ShippingAddressChange(item);
            }
          });
        }

        //set Billing Address
        if (resultSearch[index].billing_addresses) {
          resultSearch[index].billing_addresses.forEach((item, index2) => {
            if (item.default === true) {
              props.BillingAddressChange(item);
            }
          });
        }
        autoCompleteRef.current?.blur();
        setKeySearchCustomer("");
      }
    },
    [autoCompleteRef, dispatch, resultSearch, customer]
  );

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);

  useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  return (
    <Card
      title={
        <div className="d-flex">
          <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
        </div>
      }
      extra={
        <div>
          <span
            style={{
              float: "left",
              lineHeight: "40px",
              marginRight: "10px",
            }}
          >
            Nguồn <span className="text-error">*</span>
          </span>
          <Form.Item
            name="source_id"
            style={{ margin: "10px 0px" }}
            rules={[
              {
                required: true,
                message: "Vui lòng chọn nguồn đơn hàng",
              },
            ]}
          >
            <CustomSelect
              style={{ width: 300, borderRadius: "6px" }}
              showArrow
              showSearch
              placeholder="Nguồn đơn hàng 1"
              notFoundContent="Không tìm thấy kết quả"
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
            >
              {listSources.map((item, index) => (
                <CustomSelect.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.id}
                >
                  {item.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Form.Item>
        </div>
      }
    >
      {customer === null && (
        <div className="padding-lef-right" style={{ paddingTop: "15px" }}>
          <div>
            <AutoComplete
              notFoundContent={
                keySearchCustomer.length >= 3
                  ? "Không tìm thấy khách hàng"
                  : undefined
              }
              id="search_customer"
              value={keySearchCustomer}
              ref={autoCompleteRef}
              onSelect={SearchCustomerSelect}
              dropdownClassName="search-layout-customer dropdown-search-header"
              dropdownMatchSelectWidth={456}
              style={{ width: "100%" }}
              onSearch={CustomerChangeSearch}
              options={CustomerConvertResultSearch}
              dropdownRender={(menu) => (
                <div>
                  <div
                    className="row-search w-100"
                    style={{ minHeight: "42px", lineHeight: "50px" }}
                  >
                    <div className="rs-left w-100">
                      <div style={{ float: "left", marginLeft: "20px" }}>
                        <img src={addIcon} alt="" />
                      </div>
                      <div className="rs-info w-100">
                        <span
                          className="text"
                          style={{ marginLeft: "23px", lineHeight: "18px" }}
                        >
                          Thêm mới khách hàng
                        </span>
                      </div>
                    </div>
                  </div>
                  <Divider style={{ margin: "4px 0" }} />
                  {menu}
                </div>
              )}
            >
              <Input
                placeholder="Tìm hoặc thêm khách hàng... (F4)"
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              />
            </AutoComplete>
          </div>
        </div>
      )}
      <div>
        {customer !== null && (
          <div>
            <Row
              align="middle"
              justify="space-between"
              className="row-customer-detail padding-custom"
            >
              <Space>
                <Avatar size={32}>A</Avatar>
                <Link to="#" className="primary" style={{ fontSize: "16px" }}>
                  {customer.full_name}
                </Link>{" "}
                <CloseOutlined
                  onClick={CustomerDeleteInfo}
                  style={{ marginRight: "5px" }}
                />
                <Tag className="orders-tag orders-tag-vip">
                  <b>{customer.customer_level}</b>
                </Tag>
              </Space>
              <Space className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" className="icon-customer-info" />
                </span>
                <span className="customer-detail-text text-body">
                  {customer?.phone === undefined
                    ? "0987654321"
                    : customer?.phone}
                </span>
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
                    {customer?.loyalty === undefined ? "0" : customer?.loyalty}
                  </Typography.Text>
                </span>
              </Space>

              <Space className="customer-detail-birthday">
                <span className="customer-detail-icon">
                  <img
                    src={birthdayIcon}
                    alt=""
                    className="icon-customer-info"
                  />
                </span>
                <span className="customer-detail-text">{customerBirthday}</span>
              </Space>

              <Space className="customer-detail-action">
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  onClick={ShowCustomerModal}
                >
                  <img
                    src={editBlueIcon}
                    alt=""
                    style={{ width: "24px", height: "24px" }}
                  />
                </Button>
              </Space>
            </Row>
            <Divider
              className="margin-0"
              style={{ padding: 0, marginBottom: 0 }}
            />

            <div className="padding-lef-right">
              {customer.shipping_addresses !== undefined && (
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
                      <span>{shippingAddress?.name}</span>
                    </Row>
                    <Row className="customer-row-info">
                      <span>{shippingAddress?.phone}</span>
                    </Row>
                    <Row className="customer-row-info">
                      <span>{shippingAddress?.full_address}</span>
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
                            <div
                              style={{
                                color: "#4F687D",
                              }}
                            >
                              Thay đổi địa chỉ
                            </div>
                            <Button
                              type="link"
                              // onClick={ShowAddressModal}
                            >
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          <div className="change-shipping-address-content">
                            {customer.shipping_addresses.map((item, index) => (
                              <div
                                className="shipping-address-row"
                                key={item.id}
                                // onClick={(e) =>
                                //   SelectShippingAddress(item)
                                // }
                              >
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
                                <div className="shipping-customer-name">
                                  {item.name}
                                </div>
                                <div className="shipping-customer-mobile">
                                  {item.phone}
                                </div>
                                <div className="shipping-customer-address">
                                  {item.full_address}
                                </div>
                              </div>
                            ))}
                          </div>
                        }
                        trigger="click"
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
                    className="font-weight-500"
                    style={{ paddingLeft: "34px", marginTop: "14px" }}
                  >
                    <div>
                      <img
                        src={noteCustomer}
                        alt=""
                        style={{
                          width: "20px",
                          height: "20px",
                          marginRight: "10px",
                        }}
                      />
                      <span>Ghi chú của khách:</span>
                    </div>
                    <Form.Item name="customer_note">
                      <Input.TextArea
                        placeholder="Điền ghi chú"
                        rows={4}
                        maxLength={500}
                        style={{ marginTop: "10px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
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

                {customer.billing_addresses !== undefined && (
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
                        <span>{shippingAddress?.name}</span>
                      </Row>
                      <Row className="customer-row-info">
                        <span>{shippingAddress?.phone}</span>
                      </Row>
                      <Row className="customer-row-info">
                        <span>{shippingAddress?.full_address}</span>
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
                              <div
                                style={{
                                  color: "#4F687D",
                                }}
                              >
                                Thay đổi địa chỉ
                              </div>
                              <Button
                                type="link"
                                // onClick={ShowAddressModal}
                              >
                                Thêm địa chỉ mới
                              </Button>
                            </Row>
                          }
                          content={
                            <div className="change-shipping-address-content">
                              {customer.shipping_addresses.map(
                                (item, index) => (
                                  <div
                                    className="shipping-address-row"
                                    key={item.id}
                                    // onClick={(e) =>
                                    //   SelectShippingAddress(item)
                                    // }
                                  >
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
                                    <div className="shipping-customer-name">
                                      {item.name}
                                    </div>
                                    <div className="shipping-customer-mobile">
                                      {item.phone}
                                    </div>
                                    <div className="shipping-customer-address">
                                      {item.full_address}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          }
                          trigger="click"
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
                      className="font-weight-500"
                      style={{ paddingLeft: "34px", marginTop: "14px" }}
                    >
                      <div>
                        <img
                          src={noteCustomer}
                          alt=""
                          style={{
                            width: "20px",
                            height: "20px",
                            marginRight: "10px",
                          }}
                        />
                        <span>Email gửi hóa đơn:</span>
                      </div>
                      <Form.Item name="Email_note">
                        <Input
                          placeholder="Điền email"
                          maxLength={500}
                          style={{ marginTop: "10px" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <AddAddressModal
        visible={isVisibleAddress}
        onCancel={CancelConfirmAddress}
        onOk={OkConfirmAddress}
      />
      <EditCustomerModal
        visible={isVisibleCustomer}
        onCancel={CancelConfirmCustomer}
        onOk={OkConfirmCustomer}
      />
    </Card>
  );
};

export default CustomerCard;
