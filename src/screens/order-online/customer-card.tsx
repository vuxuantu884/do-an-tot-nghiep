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
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { Select } from "component/common/select";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import peopleIcon2 from "assets/img/people.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import deleteRedIcon from "assets/img/deleteRed.svg";
import pointIcon from "assets/img/point.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import AddAddressModal from "./modal/addAddressModal";
import EditCustomerModal from "./modal/editCustomerModal";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { RefSelectProps } from "antd/lib/select";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import imgdefault from "assets/icon/img-default.svg";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RegUtil } from "utils/RegUtils";
//#endregion

type CustomerCardProps = {
  InfoCustomerSet: (items: CustomerResponse) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
};

//Add query for search Customer
const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  //State
  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [keysearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = createRef<RefSelectProps>();

  //#region Modal
  const ShowAddressModal = () => {
    setVisibleAddress(true);
    setVisibleShippingAddress(false);
    setVisibleBillingAddress(false);
  };

  const CancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const ShowCustomerModal = () => {
    setVisibleCustomer(true);
  };

  const CancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  //#endregion

  //#region Search and Render result
  //Search and render customer by name, phone, code
  const CustomerChangeSearch = useCallback(
    (value) => {
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
        <div className="rs-left w-100">
          <img src={imgdefault} alt="anh" placeholder={imgdefault} />
          <div className="rs-info w-100">
            <span className="text">
              {item.full_name} - {item.phone}
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
  };

  //#endregion

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
        if (
          resultSearch[index].shipping_addresses !== undefined &&
          resultSearch[index].shipping_addresses !== null
        ) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setShippingAddress(item);
              props.ShippingAddressChange(item);
            }
          });
        }

        //set Billing Address
        if (
          resultSearch[index].billing_addresses !== undefined &&
          resultSearch[index].billing_addresses !== null
        ) {
          resultSearch[index].billing_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setBillingAddress(item);
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

  useLayoutEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch, props]);

  const handleVisibleShippingAddressChange = (value: boolean) => {
    setVisibleShippingAddress(value);
  };

  const handleVisibleBillingAddressChange = (value: boolean) => {
    setVisibleBillingAddress(value);
  };

  return (
    <Card
      title={
        <div className="d-flex">
          <img src={peopleIcon2} alt="" /> Khách hàng
        </div>
      }
      extra={
        <div className="d-flex align-items-center form-group-with-search">
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
            <Select
              style={{ width: 300 }}
              showArrow
              placeholder="Chọn nguồn đơn hàng"
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
              suffix={
                <Button
                  style={{ width: 36, height: 36 }}
                  icon={<PlusOutlined />}
                />
              }
            >
              {listSources.map((item, index) => (
                <Select.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
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
      <div className="padding-lef-right" style={{ paddingTop: "15px" }}>
        {customer === null && (
          <div>
            <div className="padding-bottom-5">
              <label htmlFor="">Tên khách hàng</label>
            </div>
            <AutoComplete
              notFoundContent={
                keysearchCustomer.length >= 3
                  ? "Không tìm thấy khách hàng"
                  : undefined
              }
              value={keysearchCustomer}
              ref={autoCompleteRef}
              onSelect={SearchCustomerSelect}
              dropdownClassName="search-layout-customer dropdown-search-header"
              dropdownMatchSelectWidth={456}
              style={{ width: "100%" }}
              onSearch={CustomerChangeSearch}
              options={CustomerConvertResultSearch}
            >
              <Input.Search
                placeholder="Tìm hoặc thêm khách hàng"
                enterButton={
                  <Button
                    style={{ width: 40, height: 36 }}
                    icon={<PlusOutlined />}
                  ></Button>
                }
                prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
              />
            </AutoComplete>
            <Divider className="margin-0" />
          </div>
        )}
      </div>
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
                <Link to="#">{customer.full_name}</Link>
                <Tag className="orders-tag orders-tag-vip">
                  <b>{customer.customer_level}</b>
                </Tag>
              </Space>
              <Space className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" />
                </span>
                <span className="customer-detail-text">
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
                  Tổng điểm{" "}
                  <Typography.Text
                    type="success"
                    style={{ color: "#0080FF" }}
                    strong
                  >
                    {customer?.loyalty === undefined ? "0" : customer?.loyalty}
                  </Typography.Text>
                </span>
              </Space>

              <Space className="customer-detail-birthday">
                <span className="customer-detail-icon">
                  <img src={bithdayIcon} alt="" />
                </span>
                <span className="customer-detail-text">{customerBirthday}</span>
              </Space>

              <Space className="customer-detail-action">
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  onClick={ShowCustomerModal}
                >
                  <img src={editBlueIcon} alt="" />
                </Button>
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  onClick={CustomerDeleteInfo}
                >
                  <img src={deleteRedIcon} alt="" />
                </Button>
              </Space>
            </Row>
            <Divider className="margin-0" />

            <div className="padding-lef-right">
              {customer.shipping_addresses !== undefined && (
                <Row gutter={24}>
                  <Col
                    xs={24}
                    lg={12}
                    className="font-weight-500 customer-info-left"
                  >
                    <div className="title-address">Địa chỉ giao hàng</div>
                    <Row className="customer-row-info">
                      <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                      <span style={{ marginLeft: 9 }}>
                        {shippingAddress?.name}
                      </span>
                    </Row>
                    <Row className="customer-row-info">
                      <img src={callIcon} alt="" style={{ width: 19 }} />{" "}
                      <span style={{ marginLeft: 9 }}>
                        {shippingAddress?.phone}
                      </span>
                    </Row>
                    <Row className="customer-row-info">
                      <img src={locationIcon} alt="" style={{ width: 19 }} />{" "}
                      <span style={{ marginLeft: 9 }}>
                        {shippingAddress?.full_address}
                      </span>
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
                            <div style={{ color: "#4F687D" }}>
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
                        onVisibleChange={handleVisibleShippingAddressChange}
                        className="change-shipping-address"
                      >
                        <Button type="link" className="btn-style">
                          Thay đổi địa chỉ giao hàng
                        </Button>
                      </Popover>
                    </Row>
                  </Col>
                  <Col xs={24} lg={12} className="font-weight-500">
                    <Form.Item
                      name="customer_note"
                      label="Ghi chú của khách hàng"
                    >
                      <Input.TextArea placeholder="Điền ghi chú" rows={4} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Divider />

              <div className="send-order-box">
                <Row style={{ marginBottom: 15 }}>
                  <Checkbox
                    className="checkbox-style"
                    onChange={ShowBillingAddress}
                  >
                    Gửi hoá đơn
                  </Checkbox>
                </Row>

                {customer.billing_addresses !== undefined && (
                  <Row gutter={24} hidden={isVisibleBilling}>
                    <Col
                      xs={24}
                      lg={12}
                      className="font-weight-500 customer-info-left"
                    >
                      <div className="title-address">Địa chỉ giao hàng</div>
                      <Row className="customer-row-info">
                        <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>
                          {shippingAddress?.name}
                        </span>
                      </Row>
                      <Row className="customer-row-info">
                        <img src={callIcon} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>
                          {shippingAddress?.phone}
                        </span>
                      </Row>
                      <Row className="customer-row-info">
                        <img src={locationIcon} alt="" style={{ width: 19 }} />{" "}
                        <span style={{ marginLeft: 9 }}>
                          {shippingAddress?.full_address}
                        </span>
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
                              <div style={{ color: "#4F687D" }}>
                                Thay đổi địa chỉ
                              </div>
                              <Button type="link" onClick={ShowAddressModal}>
                                Thêm địa chỉ mới
                              </Button>
                            </Row>
                          }
                          content={
                            <div className="change-shipping-address-content">
                              {customer.billing_addresses.map((item, index) => (
                                <div
                                  className="shipping-address-row"
                                  // onClick={(e) =>
                                  //   SelectBillingAddress(item)
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
                      <Form.Item name="email" label="Email hóa đơn đến">
                        <Input
                          type="email"
                          placeholder="Nhập email hoá đơn đến"
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

export default CustomerCard;
