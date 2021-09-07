/* eslint-disable react-hooks/exhaustive-deps */
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Popover,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import imgDefault from "assets/icon/img-default.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import editBlueIcon from "assets/img/edit_icon.svg";
import noteCustomer from "assets/img/note-customer.svg";
import addIcon from "assets/img/plus_1.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import CustomSelect from "component/custom/select.custom";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AddAddressModal from "screens/order-online/modal/add-address.modal";
import EditCustomerModal from "screens/order-online/modal/edit-customer.modal";
import { StyledComponent } from "./styles";

type CardCustomerPropType = {
  InfoCustomerSet: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  parentCustomerDetail: CustomerResponse | null;
};

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

const CardCustomer: React.FC<CardCustomerPropType> = (
  props: CardCustomerPropType
) => {
  const {
    parentCustomerDetail,
    InfoCustomerSet,
    ShippingAddressChange,
    BillingAddressChange,
  } = props;
  console.log("parentCustomerDetail", parentCustomerDetail);
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
  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = createRef<RefSelectProps>();

  const ShowAddressModal = () => {
    setVisibleAddress(true);
  };
  const ShowBillingAddress = (e: any) => {
    setVisibleBilling(e.target.checked);
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

  const CustomerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      initQueryCustomer.request = value;
      dispatch(CustomerSearch(initQueryCustomer, setResultSearch));
    },
    [dispatch, initQueryCustomer]
  );

  const CustomerRenderSearchResult = (item: CustomerResponse) => {
    return (
      <div className="row-search w-100">
        <div className="rs-left w-100">
          <img
            src={imgDefault}
            alt=""
            placeholder={imgDefault}
            className="logo-customer"
          />
          <div className="rs-info w-100">
            <span>
              {item.full_name} <i className="icon-dot"></i>
              <span>{item.phone}</span>
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

  const CustomerDeleteInfo = () => {
    setCustomer(null);
    InfoCustomerSet(null);
    setVisibleBilling(false);
  };

  const SearchCustomerSelect = useCallback(
    (value, o) => {
      let index: number = -1;
      index = resultSearch.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        setCustomer(resultSearch[index]);
        InfoCustomerSet(resultSearch[index]);

        if (resultSearch[index].shipping_addresses) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setShippingAddress(item);
              ShippingAddressChange(item);
            }
          });
        }

        if (resultSearch[index].billing_addresses) {
          resultSearch[index].billing_addresses.forEach((item, index2) => {
            if (item.default === true) {
              BillingAddressChange(item);
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

  const renderCardExtra = () => {
    return (
      <div className="cardExtra__content">
        <div>
          Nguồn <span className="text-error">*</span>
        </div>
        <Form.Item
          name="source_id"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nguồn đơn hàng",
            },
          ]}
        >
          <CustomSelect
            showArrow
            showSearch
            placeholder="Nguồn đơn hàng"
            notFoundContent="Không tìm thấy kết quả"
            filterOption={(input, option) => {
              if (option) {
                return (
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
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
    );
  };

  const renderCustomerSearch = () => {
    if (customer) {
      return;
    }
    return (
      <div className="padding-lef-right">
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
                <div className="row-search w-100">
                  <div className="rs-left w-100">
                    <div>
                      <img src={addIcon} alt="" />
                    </div>
                    <div className="rs-info w-100">
                      <span className="text">Thêm mới khách hàng</span>
                    </div>
                  </div>
                </div>
                <Divider />
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
    );
  };

  const renderCustomerChangeAddress = () => {
    if (!customer) {
      return;
    }
    return (
      <Popover
        placement="bottomLeft"
        title={
          <Row
            justify="space-between"
            align="middle"
            className="change-shipping-address-title"
          >
            <div>Thay đổi địa chỉ</div>
            <Button type="link">Thêm địa chỉ mới</Button>
          </Row>
        }
        content={
          <div className="change-shipping-address-content">
            {customer.shipping_addresses.map((item, index) => (
              <div className="shipping-address-row" key={item.id}>
                <div className="shipping-address-name">
                  Địa chỉ 1
                  <Button
                    type="text"
                    onClick={ShowAddressModal}
                    className="p-0"
                  >
                    <img src={editBlueIcon} alt="" />
                  </Button>
                </div>
                <div className="shipping-customer-name">{item.name}</div>
                <div className="shipping-customer-mobile">{item.phone}</div>
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
        <span>Thay đổi địa chỉ giao hàng 23</span>
      </Popover>
    );
  };

  useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  useEffect(() => {
    if (parentCustomerDetail) {
      setCustomer(parentCustomerDetail);
      if (parentCustomerDetail.shipping_addresses) {
        setShippingAddress(parentCustomerDetail.shipping_addresses[0]);
      }
    }
  }, [parentCustomerDetail]);

  return (
    <StyledComponent>
      <Card title="THÔNG TIN KHÁCH HÀNG" extra={renderCardExtra()}>
        {renderCustomerSearch()}
        {customer && (
          <div>
            <Row
              align="middle"
              justify="space-between"
              className="row-customer-detail padding-custom"
            >
              <Space>
                <Avatar size={32}>A</Avatar>
                <Link to="#" className="primary">
                  {customer.full_name}
                </Link>
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
                  <Typography.Text type="success" strong>
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
                  <img src={editBlueIcon} alt="" />
                </Button>
              </Space>
            </Row>
            <Divider />

            <div className="boxCustomerInformation">
              {customer.shipping_addresses && (
                <Row gutter={50}>
                  <Col
                    xs={24}
                    lg={12}
                    className="font-weight-500 boxCustomerInformation__column"
                  >
                    <div className="column__title">
                      <img src={addressIcon} alt="" />
                      Địa chỉ giao hàng:
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.name}</span>
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.phone}</span>
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.full_address}</span>
                    </div>
                    {renderCustomerChangeAddress()}
                  </Col>
                  <Col
                    xs={24}
                    lg={12}
                    className="boxCustomerInformation__column"
                  >
                    <div className="column__title">
                      <img src={noteCustomer} alt="" />
                      <span>Ghi chú của khách:</span>
                    </div>
                    <Form.Item name="customer_note">
                      <Input.TextArea
                        placeholder="Điền ghi chú"
                        rows={4}
                        maxLength={500}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </div>
            <div className="send-order-box">
              <Row>
                <Checkbox
                  className="checkbox-style"
                  onChange={ShowBillingAddress}
                >
                  Gửi hoá đơn
                </Checkbox>
              </Row>

              {customer.billing_addresses && (
                <Row gutter={24} hidden={!isVisibleBilling}>
                  <Col
                    xs={24}
                    lg={12}
                    className="font-weight-500 customer-info-left"
                  >
                    <div className="title-address">
                      <img src={addressIcon} alt="" />
                      Địa chỉ nhận hóa đơn:
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.name}</span>
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.phone}</span>
                    </div>
                    <div className="customer-row-info">
                      <span>{shippingAddress?.full_address}</span>
                    </div>
                    {renderCustomerChangeAddress()}
                  </Col>
                  <Col xs={24} lg={12} className="font-weight-500">
                    <div className="column__title">
                      <img src={noteCustomer} alt="" />
                      <span>Email gửi hóa đơn:</span>
                    </div>
                    <Form.Item name="Email_note">
                      <Input placeholder="Điền email" maxLength={500} />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </div>
          </div>
        )}

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
    </StyledComponent>
  );
};

export default CardCustomer;
