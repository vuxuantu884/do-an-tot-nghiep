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
  Select,
} from "antd";
import React, {
  createRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import peopleIcon2 from "assets/img/people.svg";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import deleteRedIcon from "assets/img/deleteRed.svg";
import pointIcon from "assets/img/point.svg";
import plusBlueIcon from "assets/img/plus-blue.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import { SearchOutlined } from "@ant-design/icons";
import AddAddressModal from "./modal/addAddressModal";
import EditCustomerModal from "./modal/editCustomerModal";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { RefSelectProps } from "antd/lib/select";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { OnCustomerSearchChange } from "domain/actions/customer/customer.action";
import imgdefault from "assets/icon/img-default.svg";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { CustomerSearchQuery } from "model/query/customer.query";
import { Email } from "utils/RegUtils";
//#endregion

type CustomerCardProps = {
  changeInfoCustomer: (items: CustomerResponse) => void;
  selectSource: (source: number) => void;
  sourceSelect: boolean;
  changeEmail: (email: string) => void;
  changeShippingAddress: (items: ShippingAddress) => void;
  changeBillingAddress: (items: BillingAddress) => void;
};

const initQuery: CustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 0,
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  //State
  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [keysearch, setKeysearch] = useState("");
  const autoCompleteRef = createRef<RefSelectProps>();
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] =
    useState<BillingAddress | null>(null);
  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");

  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [inputEmail, setInputEmail] = useState<string>("");
  //#region Modal
  const showAddressModal = () => {
    setVisibleAddress(true);
    setVisibleShippingAddress(false);
    setVisibleBillingAddress(false);
  };

  const onCancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const onOkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const showCustomerModal = () => {
    setVisibleCustomer(true);
  };

  const onCancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const onOkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const showBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };
  //#endregion

  //#region Search and Render result
  //Search and render customer by name, phone, code
  const onChangeSearch = useCallback(
    (value) => {
      setKeysearch(value);
      initQuery.request = value;
      dispatch(OnCustomerSearchChange(initQuery, setResultSearch));
    },
    [dispatch]
  );

  //Render result search
  const renderSearch = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100">
          <img src={imgdefault} alt="anh" placeholder={imgdefault} />
          <div className="rs-info w-100">
            <span
              style={{ color: "#37394D", marginTop: "10px" }}
              className="text"
            >
              {item.full_name} - {item.phone}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const convertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.forEach((item: CustomerResponse, index: number) => {
      options.push({
        label: renderSearch(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [dispatch, resultSearch]);

  //Delete customer
  const deleteCustomer = () => {
    setCustomer(null);
  };

  //#endregion

  const onSearchCustomerSelect = useCallback(
    (v, o) => {
      let index: number = -1;
      index = resultSearch.findIndex(
        (r: CustomerResponse) => r.id && r.id.toString() === v
      );
      if (index !== -1) {
        setCustomer(resultSearch[index]);
        props.changeInfoCustomer(resultSearch[index]);
        if (
          resultSearch[index].shipping_addresses !== undefined &&
          resultSearch[index].shipping_addresses !== null
        ) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setShippingAddress(item);
              props.changeShippingAddress(item);
            }
          });
        }

        if (
          resultSearch[index].billing_addresses !== undefined &&
          resultSearch[index].billing_addresses !== null
        ) {
          resultSearch[index].billing_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setBillingAddress(item);
              props.changeBillingAddress(item);
            }
          });
        }

        autoCompleteRef.current?.blur();
        setKeysearch("");
      }
    },
    [autoCompleteRef, dispatch, resultSearch, customer]
  );

  const changeNoteOrder = (value: string) => {
    let item = customer;
    if (item !== null) {
      item.notes = value;
      setCustomer(item);
    }
  };

  const changeEmailBillingAddress = (value: string) => {
    const email = value;
    const emailValid = validateEmail(email);
    setInputEmail(value);
    setIsEmailValid(emailValid);

    props.changeEmail(value);

    let item = billingAddress;
    if (item !== null && emailValid === true) {
      item.email = value;
      setBillingAddress(item);
    }
  };

  const onSelectShippingAddress = (value: ShippingAddress) => {
    setShippingAddress(value);
    props.changeShippingAddress(value);
  };

  const onSelectBillingAddress = (value: ShippingAddress) => {
    setBillingAddress(value);
    props.changeBillingAddress(value);
  };

  const onChangeSource = useCallback(
    (value: number) => {
      props.selectSource(value);
    },
    [props]
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

  const validateEmail = (email: string) => {
    const re = Email;
    return re.test(email);
  };

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
          <Form.Item
            name="source"
            label="Nguồn"
            style={{ margin: "10px 0px" }}
            rules={[
              { required: true, message: "Vui lòng chọn nguồn đơn hàng" },
            ]}
          >
            <Select
              className="select-with-search"
              showSearch
              style={{ width: "200px" }}
              placeholder="Chọn nguồn đơn hàng"
              onChange={onChangeSource}
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
                <Select.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.id}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            {props.sourceSelect === true && (
              <div>
                <div className="ant-form-item-explain ant-form-item-explain-error" style={{padding: '5px'}}>
                  <div role="alert">Vui lòng chọn nguồn đơn hàng</div>
                </div>
              </div>
            )}
          </Form.Item>
        </div>
      }
    >
      <div className="form-group form-group-with-search form-search-customer">
        <label htmlFor="" className="">
          Tên khách hàng
        </label>
        <div>
          <AutoComplete
            notFoundContent={
              keysearch.length >= 3 ? "Không tìm thấy khách hàng" : undefined
            }
            value={keysearch}
            ref={autoCompleteRef}
            onSelect={onSearchCustomerSelect}
            dropdownClassName="search-layout dropdown-search-header"
            dropdownMatchSelectWidth={456}
            className="w-100"
            onSearch={onChangeSearch}
            options={convertResultSearch}
          >
            <Input.Search
              placeholder="Tìm hoặc thêm khách hàng"
              enterButton={
                <Button type="text">
                  <img src={plusBlueIcon} alt="" />
                </Button>
              }
              prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
            />
          </AutoComplete>
        </div>
      </div>
      {customer !== null && (
        <React.Fragment>
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
                <span style={{ fontWeight: 500, fontSize: "14px" }}>
                  {customer?.full_name === undefined
                    ? "Nguyễn Văn A"
                    : customer?.full_name}
                </span>
                <span className="cdn-level">
                  {customer?.customer_level === undefined
                    ? "Level 1"
                    : customer?.customer_level}
                </span>
              </Space>
            </Row>

            <Space className="customer-detail-phone">
              <span className="customer-detail-icon">
                <img src={callIcon} alt="" />
              </span>
              <span className="customer-detail-text">
                {customer?.phone === undefined ? "0987654321" : customer?.phone}
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
              <Button type="text" className="p-0" onClick={showCustomerModal}>
                <img src={editBlueIcon} alt="" />
              </Button>
              <Button type="text" className="p-0" onClick={deleteCustomer}>
                <img src={deleteRedIcon} alt="" />
              </Button>
            </Space>
          </Row>
          <Divider />
          <div className="customer-info">
            {customer.shipping_addresses !== undefined && (
              <Row gutter={24}>
                <Col
                  xs={24}
                  lg={12}
                  className="font-weight-500 customer-info-left"
                >
                  <div>Địa chỉ giao hàng</div>
                  <Row className="row-info customer-row-info">
                    <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                    <span style={{ marginLeft: 9 }}>
                      {shippingAddress?.name}
                    </span>
                  </Row>
                  <Row className="row-info customer-row-info">
                    <img src={callIcon} alt="" />{" "}
                    <span>{shippingAddress?.phone}</span>
                  </Row>
                  <Row className="row-info customer-row-info">
                    <img src={locationIcon} alt="" />{" "}
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
                          <div style={{ color: "#4F687D" }}>
                            Thay đổi địa chỉ
                          </div>
                          <Button type="link" onClick={showAddressModal}>
                            Thêm địa chỉ mới
                          </Button>
                        </Row>
                      }
                      content={
                        <div className="change-shipping-address-content">
                          {customer.shipping_addresses.map((item, index) => (
                            <div
                              className="shipping-address-row"
                              onClick={(e) => onSelectShippingAddress(item)}
                            >
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
                      visible={visibleShippingAddress}
                      onVisibleChange={handleVisibleShippingAddressChange}
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
                    <Input.TextArea
                      onChange={(e) => changeNoteOrder(e.target.value)}
                      placeholder="Điền ghi chú"
                      rows={4}
                    />
                  </div>
                </Col>
              </Row>
            )}
            <Divider />

            <div className="send-order-box">
              <Row style={{ marginBottom: 15 }}>
                <Checkbox
                  className="checkbox-style"
                  onChange={showBillingAddress}
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
                    <div>Địa chỉ gửi hoá đơn</div>
                    <Row className="row-info customer-row-info">
                      <img src={peopleIcon2} alt="" style={{ width: 19 }} />{" "}
                      <span style={{ marginLeft: 9 }}>
                        {billingAddress?.name}
                      </span>
                    </Row>
                    <Row className="row-info customer-row-info">
                      <img src={callIcon} alt="" />{" "}
                      <span>{billingAddress?.phone}</span>
                    </Row>
                    <Row className="row-info customer-row-info">
                      <img src={locationIcon} alt="" />{" "}
                      <span>{billingAddress?.full_address}</span>
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
                            <Button type="link" onClick={showAddressModal}>
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          <div className="change-shipping-address-content">
                            {customer.billing_addresses.map((item, index) => (
                              <div
                                className="shipping-address-row"
                                onClick={(e) => onSelectBillingAddress(item)}
                              >
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
                        visible={visibleBillingAddress}
                        onVisibleChange={handleVisibleBillingAddressChange}
                        className="change-shipping-address"
                      >
                        <Button type="link" className="p-0 m-0">
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
                      <Input
                        type="email"
                        onChange={(e) =>
                          changeEmailBillingAddress(e.target.value)
                        }
                        placeholder="Nhập email hoá đơn đến"
                      />
                      {isEmailValid === false && inputEmail !== "" && (
                        <span style={{ color: "red" }}>
                          Email chưa đúng định dạng
                        </span>
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          </div>
        </React.Fragment>
      )}

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
