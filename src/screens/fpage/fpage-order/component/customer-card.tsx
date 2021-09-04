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
import addIcon from "assets/img/plus_1.svg";
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
import { RegUtil } from "utils/RegUtils";
import { SourceResponse } from "model/response/order/source.response";
import { CustomerSearchQuery } from "model/query/customer.query";
//#end region

type CustomerCardProps = {
  setCustomerDetail: (items: CustomerResponse | null) => void;
  InfoCustomerSet: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  customerDetail: CustomerResponse | null;
  setIsButtonSelected: (items: boolean) => void;
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
  const { customerDetail, setCustomerDetail, setIsButtonSelected } = props;
  //State
  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(false);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const autoCompleteRef = createRef<RefSelectProps>();
  //#region Modal
  const ShowAddressModal = () => {
    setVisibleAddress(false);
  };
  console.log(resultSearch);
  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const CancelConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const ShowBillingAddress = (e: any) => {
    setVisibleBilling(e.target.checked);
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

  const fpageAutoFillCustomerInfor = () => {
    if (customerDetail) {
      setCustomer(customerDetail);
      props.InfoCustomerSet(customerDetail);
      //set Shipping Address
      if (customerDetail.shipping_addresses) {
        customerDetail.shipping_addresses.forEach((item, index2) => {
          if (item.default === true) {
            setShippingAddress(item);
            props.ShippingAddressChange(item);
          }
        });
      }

      //set Billing Address
      if (customerDetail.billing_addresses) {
        customerDetail.billing_addresses.forEach((item, index2) => {
          if (item.default === true) {
            props.BillingAddressChange(item);
          }
        });
      }
      autoCompleteRef.current?.blur();
      setKeySearchCustomer("");
    }
  };
  //Render result search
  useEffect(() => {
    fpageAutoFillCustomerInfor();
  }, [fpageAutoFillCustomerInfor]);

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
    setCustomerDetail(null);
    setVisibleBilling(false);
  };

  //#end region

  const SearchCustomerSelect = useCallback(
    (value, o) => {
      console.log(value);
      let index: number = -1;
      index = resultSearch.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        setCustomer(resultSearch[index]);
        setCustomerDetail(resultSearch[index]);
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
  const handleCreateCustomer = () => {
    setIsButtonSelected(false)
    console.log(123);
  };
  return (
    <Card
      extra={
        <div>
          <Form.Item
            className="order-source-selected"
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
              style={{ width: "100%", borderRadius: "6px" }}
              showArrow
              showSearch
              placeholder="Nguồn đơn hàng"
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
        <div style={{ padding: "12px 24px" }}>
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
                    onClick={() => handleCreateCustomer()}
                    className="row-search w-100"
                    style={{
                      minHeight: "42px",
                      lineHeight: "50px",
                      cursor: "pointer",
                    }}
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

              {/* <Space className="customer-detail-point">
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
                  Sửa 
                  <img
                    src={editBlueIcon}
                    alt=""
                    style={{ width: "24px", height: "24px" }}
                  />
                </Button>
              </Space> */}
            </Row>
            <Divider
              className="margin-0"
              style={{ padding: 0, marginBottom: 0 }}
            />

            <div style={{ padding: "12px 24px" }}>
              {customer.shipping_addresses !== undefined && (
                <Row gutter={24}>
                  <Col
                    span={12}
                    style={{
                      borderRight: "1px solid #E5E5E5",
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
                        <Button type="link" style={{ padding: 0 }}>
                          Thay đổi địa chỉ giao hàng
                        </Button>
                      </Popover>
                    </Row>
                  </Col>
                  <Col span={12} className="font-weight-500 note-customer">
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
                <Row style={{ marginTop: 10 }}>
                  <Checkbox
                    className="checkbox-style"
                    onChange={ShowBillingAddress}
                    style={{ marginLeft: "3px" }}
                  >
                    Gửi hoá đơn
                  </Checkbox>
                </Row>

                {customer.billing_addresses !== undefined && (
                  <Row
                    gutter={24}
                    hidden={!isVisibleBilling}
                    style={{ marginTop: "10px" }}
                  >
                    <Col
                      span={12}
                      style={{
                        borderRight: "1px solid #E5E5E5",
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
                          <Button type="link" style={{ padding: 0 }}>
                            Thay đổi địa chỉ giao hàng
                          </Button>
                        </Popover>
                      </Row>
                    </Col>
                    <Col
                      span={12}
                      className="font-weight-500 fpage-order-email"
                      style={{ padding: "0 12px" }}
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
                      <Form.Item
                        style={{ marginTop: "10px" }}
                        name="Email_note"
                        // label={<b>Email gửi hóa đơn:</b>}
                        rules={[
                          {
                            pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                            message: "Vui lòng nhập đúng định dạng email",
                          },
                        ]}
                      >
                        <Input
                          maxLength={500}
                          type="text"
                          placeholder="Nhập email"
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
