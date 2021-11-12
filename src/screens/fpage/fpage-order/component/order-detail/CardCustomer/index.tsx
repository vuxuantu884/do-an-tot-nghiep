/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Popover,
  Row,
  Tag,
  Typography,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import imageDefault from "assets/icon/img-default.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import editBlueIcon from "assets/img/edit_icon.svg";
import noteCustomer from "assets/img/note-customer.svg";
import pointIcon from "assets/img/point.svg";
import logoMobile from "assets/icon/logoMobile.svg";
import addressIcon from "assets/img/user-pin.svg";
import CustomSelect from "component/custom/select.custom";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CustomerGroups,
  CustomerSearch,
  UpdateShippingAddress,
  UpdateBillingAddress,
  CreateShippingAddress,
  CreateBillingAddress,
} from "domain/actions/customer/customer.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import {
  CustomerShippingAddress,
  CustomerBillingAddress,
} from "model/request/customer.request";
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
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AddAddressModal from "screens/fpage/fpage-order/modal/add-address.modal";
import EditCustomerModal from "screens/fpage/fpage-order/modal/edit-customer.modal";
import { showError, showSuccess } from "utils/ToastUtils";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import UrlConfig from "config/url.config";
import CustomerModal from "screens/customer/customer-modal";
import FormCustomerShippingAddress from "screens/customer/customer-detail/customer-shipping/shipping.form.modal";
import FormCustomerBillingAddress from "screens/customer/customer-detail/customer-billing/billing.form.modal";

//#end region

type CustomerCardProps = {
  setCustomer: (items: CustomerResponse | null) => void;
  setShippingAddress: (items: ShippingAddress) => void;
  setBillingAddress: (items: BillingAddress) => void;
  handleCustomerById: (value: number | null) => void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  shippingAddress: ShippingAddress | null;
  billingAddress: BillingAddress | null;
};

//Add query for search Customer
const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  limit: 5,
  page: 1,
  gender: null,
  from_birthday: null,
  to_birthday: null,
  company: null,
  from_wedding_date: null,
  to_wedding_date: null,
  customer_type_id: null,
  customer_group_id: null,
  customer_level_id: undefined,
  responsible_staff_code: null,
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  const {
    customer,
    setCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
    handleCustomerById,
    shippingAddress,
    billingAddress,
    setShippingAddress,
    setBillingAddress,
  } = props;
  //State
  const dispatch = useDispatch();
  const autoCompleteRef = createRef<RefSelectProps>();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(false);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);
  const [countryId] = React.useState<number>(233);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const [idShippingSelected, setIdShippingSelected] = useState<number | null>(
    null
  );
  const [idBillingSelected, setIdBillingSelected] = useState<number | null>(
    null
  );
  //#region Modal
  const ShowBillingAddress = (e: any) => {
    setVisibleBilling(e.target.checked);
  };
  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmCustomerCreate = () => {
    setModalAction("create");
    setVisibleCustomer(true);
  };
  const OkConfirmCustomerEdit = () => {
    setModalAction("edit");
    setVisibleCustomer(true);
  };
  const CancelConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  //#end region

  //#region Search and Render result
  //Search and render customer by name, phone, code
  const CustomerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      initQueryCustomer.request = value.trim();
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
            src={imageDefault}
            alt="anh"
            placeholder={imageDefault}
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
    setVisibleBilling(false);
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

        //set Shipping Address
        if (resultSearch[index].shipping_addresses) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setShippingAddress(item);
            }
          });
        }

        //set Billing Address
        if (resultSearch[index].billing_addresses) {
          resultSearch[index].billing_addresses.forEach((item, index2) => {
            if (item.default === true) {
              setBillingAddress(item);
            }
          });
        }
        autoCompleteRef.current?.blur();
        setKeySearchCustomer("");
        setDistrictId(resultSearch[index].district_id);
      }
    },
    [autoCompleteRef, dispatch, resultSearch, customer]
  );

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "POS");
  }, [listSource]);

  useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  useEffect(() => {
    dispatch(CustomerGroups(setGroups));
  }, [dispatch]);

  useEffect(() => {
    if (customer && customer?.shipping_addresses?.length > 0) {
      const shippingSelected = customer?.shipping_addresses?.find(
        (item) => item.id === idShippingSelected
      );
      const addressDefault = customer.shipping_addresses?.find(
        (item) => item.default
      );
      if (shippingSelected) {
        setShippingAddress(shippingSelected);
      } else if (addressDefault) {
        setShippingAddress(addressDefault);
      }

      const billingSelected = customer?.billing_addresses?.find(
        (item) => item.id === idBillingSelected
      );
      const billingDefault = customer?.billing_addresses?.find(
        (item) => item.default
      );

      if (billingSelected) {
        setBillingAddress(billingSelected);
      } else if (billingDefault) {
        setBillingAddress(billingDefault);
      }
    }
    if (customer && customer?.billing_addresses?.length > 0) {
      const billingSelected = customer?.billing_addresses?.find(
        (item) => item.id === idBillingSelected
      );
      const billingDefault = customer?.billing_addresses?.find(
        (item) => item.default
      );

      if (billingSelected) {
        setBillingAddress(billingSelected);
      } else if (billingDefault) {
        setBillingAddress(billingDefault);
      }
    }
  }, [customer]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
    }
  };

  const handleChangeCustomer = (customers: any) => {
    if (customers) {
      setCustomer(customers);
    }
  };

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id ===
      (loyaltyPoint?.loyalty_level_id === null
        ? 0
        : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

  const [modalSingleShippingAddress, setModalShippingAddress] =
    React.useState<CustomerShippingAddress>();
  const [isShowModalShipping, setIsShowModalShipping] = React.useState(false);
  const [isVisibleShippingAddressPopover, setVisibleShippingAddressPopover] =
    useState(false);

  const createShippingAddress = () => {
    setModalAction("create");
    setIsShowModalShipping(true);
    setVisibleShippingAddressPopover(false);
  };
  const editShippingAddress = (address: any) => {
    setModalAction("edit");
    setModalShippingAddress(address);
    setIsShowModalShipping(true);
    setVisibleShippingAddressPopover(false);
  };
  const reloadPage = () => {
    handleCustomerById(customer && customer.id);
  };
  const handleTempShippingAddress = (value: any) => {
    setIdShippingSelected(value.id);
    setShippingAddress(value);
    setVisibleShippingAddressPopover(false);
  };

  const handleShippingAddressDefault = (value: any, item: any) => {
    value.stopPropagation();
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer) {
      dispatch(
        UpdateShippingAddress(
          _item.id,
          customer.id,
          _item,
          (data: ShippingAddress) => {
            setVisibleShippingAddressPopover(false);
            reloadPage();
            if (data) {
              showSuccess("Đặt mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
    }
  };

  const handleShippingAddressForm = {
    create: (formValue: CustomerShippingAddress) => {
      if (customer && customer?.shipping_addresses.length <= 0) {
        formValue.is_default = true
      } else {
        formValue.is_default = false;
      }
      if (customer)
        dispatch(
          CreateShippingAddress(
            customer.id,
            formValue,
            (data: ShippingAddress) => {
              setIsShowModalShipping(false);
              reloadPage();
              setIdShippingSelected(data.id)
              data
                ? showSuccess("Thêm mới địa chỉ thành công")
                : showError("Thêm mới địa chỉ thất bại");
            }
          )
        );
    },
    edit: (formValue: CustomerShippingAddress) => {
      formValue.is_default = formValue.default;
      if (modalSingleShippingAddress) {
        if (customer)
          dispatch(
            UpdateShippingAddress(
              modalSingleShippingAddress.id,
              customer.id,
              formValue,
              (data: ShippingAddress) => {
                setIsShowModalShipping(false);
                reloadPage();
                setIdShippingSelected(data.id)
                data
                  ? showSuccess("Cập nhật địa chỉ thành công")
                  : showError("Cập nhật địa chỉ thất bại");
              }
            )
          );
      }
    },
  };

  const [modalSingleBillingAddress, setModalBillingAddress] =
    React.useState<CustomerShippingAddress>();
  const [isShowModalBilling, setIsShowModalBilling] = React.useState(false);
  const [isVisibleBillingAddressPopover, setVisibleBillingAddressPopover] =
    useState(false);

  const createBillingAddress = () => {
    setModalAction("create");
    setIsShowModalBilling(true);
    setVisibleBillingAddressPopover(false);
  };
  const editBillingAddress = (address: any) => {
    setModalAction("edit");
    setModalBillingAddress(address);
    setIsShowModalBilling(true);
    setVisibleBillingAddressPopover(false);
  };
  const handleTempBillingAddress = (value: any) => {
    setIdBillingSelected(value.id);
    setBillingAddress(value);
    setVisibleBillingAddressPopover(false);
  };
  const handleBillingAddressDefault = (value: any, item: any) => {
    value.stopPropagation();
    let _item = { ...item };
    if (_item.default === true) return showError("Không thể bỏ mặc định");
    _item.is_default = value.target.checked;
    if (customer) {
      dispatch(
        UpdateBillingAddress(
          _item.id,
          customer.id,
          _item,
          (data: BillingAddress) => {
            setVisibleBillingAddressPopover(false);
            reloadPage();
            setIdBillingSelected(data.id)
            if (data) {
              showSuccess("Đặt mặc định thành công");
            } else {
              showError("Đặt mặc định thất bại");
            }
          }
        )
      );
    }
  };

  const handleBillingAddressForm = {
    create: (formValue: CustomerBillingAddress) => {
      if (customer && customer?.billing_addresses.length <= 0) {
        formValue.is_default = true
      } else {
        formValue.is_default = false;
      }
      if (customer)
        dispatch(
          CreateBillingAddress(
            customer.id,
            formValue,
            (data: BillingAddress) => {
              setIsShowModalBilling(false);
              reloadPage();
              setIdBillingSelected(data.id)
              data
                ? showSuccess("Thêm mới địa chỉ thành công")
                : showError("Thêm mới địa chỉ thất bại");
            }
          )
        );
    },
    edit: (formValue: CustomerBillingAddress) => {
      formValue.is_default = formValue.default;
      if (modalSingleBillingAddress) {
        if (customer)
          dispatch(
            UpdateBillingAddress(
              modalSingleBillingAddress.id,
              customer.id,
              formValue,
              (data: BillingAddress) => {
                setIsShowModalBilling(false);
                reloadPage();
                data
                  ? showSuccess("Cập nhật địa chỉ thành công")
                  : showError("Cập nhật địa chỉ thất bại");
              }
            )
          );
      }
    },
  };
  return (
    <Card
      className="padding-12"
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
              <div className="dropdown-custom">
                <Button
                  icon={<AiOutlinePlusCircle size={24} />}
                  className="dropdown-custom-add-new"
                  type="link"
                  onClick={() => OkConfirmCustomerCreate()}
                >
                  Thêm mới khách hàng
                </Button>
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
      )}
      <div>
        {customer !== null && (
          <div>
            <Row
              align="middle"
              justify="space-between"
              className="row-customer-detail"
              style={{ margin: "10px 0" }}
            >
              <Col style={{ display: "flex", alignItems: "center" }}>
                <div className="fpage-order-avatar-customer">
                  <img
                    style={{ width: 34, height: 34 }}
                    src={logoMobile}
                    alt="logo"
                  />
                </div>
                <Link
                  target="_blank"
                  to={`${UrlConfig.CUSTOMER}/${customer?.id}`}
                  className="primary"
                  style={{ fontSize: "16px", margin: "0 10px" }}
                >
                  {customer?.full_name}
                </Link>{" "}
                <Tag className="orders-tag orders-tag-vip">
                  <b>{!rankName ? "Bình thường" : rankName}</b>
                </Tag>
              </Col>
              <Col style={{ display: "flex", alignItems: "center" }}>
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" />
                </span>
                <span
                  className="customer-detail-text text-body"
                  style={{ marginRight: "10px" }}
                >
                  {customer?.phone === undefined
                    ? "0987654321"
                    : customer?.phone}
                </span>
                {levelOrder < 3 && (
                  <CloseOutlined
                    style={{ color: "red" }}
                    onClick={CustomerDeleteInfo}
                  />
                )}
              </Col>
            </Row>
            <Divider style={{ padding: 0, margin: 0 }} />
            <Row align="middle" justify="space-between">
              <Col className="customer-detail-point">
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
                    {loyaltyPoint?.point === undefined
                      ? "0"
                      : loyaltyPoint?.point}
                  </Typography.Text>
                </span>
              </Col>

              {customer?.birthday !== null && (
                <Col className="customer-detail-birthday">
                  <span className="customer-detail-icon">
                    <img
                      src={birthdayIcon}
                      alt=""
                      className="icon-customer-info"
                    />
                  </span>
                  <span className="customer-detail-text">
                    {customerBirthday}
                  </span>
                </Col>
              )}

              <Col className="customer-detail-action">
                <Button
                  type="text"
                  className="p-0 ant-btn-custom"
                  onClick={OkConfirmCustomerEdit}
                >
                  <img
                    src={editBlueIcon}
                    alt=""
                    style={{ width: "24px", height: "24px" }}
                  />
                </Button>
              </Col>
            </Row>
            <Divider style={{ padding: 0, margin: 0 }} />

            <div>
              {customer?.shipping_addresses !== undefined && (
                <Row gutter={24} style={{ paddingTop: 10 }}>
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
                      <Col className="font-weight-500 pd-right" span={6}>
                        Họ tên:
                      </Col>
                      <Col className="word-break-fpage" span={18}>
                        {shippingAddress?.name}
                      </Col>
                    </Row>
                    <Row className="customer-row-info">
                      <Col className="font-weight-500 pd-right" span={6}>
                        Số ĐT:
                      </Col>
                      <Col className="word-break-fpage" span={18}>
                        {shippingAddress?.phone}
                      </Col>
                    </Row>
                    <Row className="customer-row-info">
                      <Col className="font-weight-500 pd-right" span={6}>
                        Địa chỉ:
                      </Col>
                      <Col className="word-break-fpage" span={18}>
                        {shippingAddress?.full_address}
                      </Col>
                    </Row>

                    <Row>
                      <Popover
                        placement="bottomLeft"
                        overlayStyle={{ zIndex: 17 }}
                        title={
                          <Row
                            justify="space-between"
                            align="middle"
                            className="change-shipping-address-title"
                            style={{ width: "100%" }}
                          >
                            <div
                              style={{
                                color: "#4F687D",
                              }}
                            >
                              Thay đổi địa chỉ
                            </div>
                            <Button type="link" onClick={createShippingAddress}>
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          <div className="change-shipping-address-content">
                            {customer?.shipping_addresses?.map((item, index) => (
                              <div
                                className="customer-shipping-address"
                                key={index}
                                onClick={() => handleTempShippingAddress(item)}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="shipping-address-row">
                                  <div className="shipping-address-name word-underline">
                                    Địa chỉ {index + 1}{" "}
                                    <Button
                                      type="text"
                                      onClick={() => {
                                        editShippingAddress(item);
                                      }}
                                      className="p-0"
                                    >
                                      <img src={editBlueIcon} alt="" />
                                    </Button>
                                    <Checkbox
                                      style={{ marginLeft: "auto" }}
                                      checked={item.default}
                                      onClick={(value) =>
                                        handleShippingAddressDefault(
                                          value,
                                          item
                                        )
                                      }
                                    />
                                  </div>
                                  <Row className="shipping-customer-address">
                                    <Col
                                      className="font-weight-500 pd-right"
                                      span={3}
                                    >
                                      Họ tên:
                                    </Col>
                                    <Col className="word-break-fpage" span={21}>
                                      {item.name}
                                    </Col>
                                  </Row>
                                  <Row className="shipping-customer-address">
                                    <Col
                                      className="font-weight-500 pd-right"
                                      span={3}
                                    >
                                      Số ĐT:
                                    </Col>
                                    <Col className="word-break-fpage" span={21}>
                                      {item.phone}
                                    </Col>
                                  </Row>
                                  <Row className="shipping-customer-address">
                                    <Col
                                      className="font-weight-500 pd-right"
                                      span={3}
                                    >
                                      Địa chỉ:
                                    </Col>
                                    <Col className="word-break-fpage" span={21}>
                                      {item.full_address}
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            ))}
                          </div>
                        }
                        trigger="click"
                        className="change-shipping-address"
                        visible={isVisibleShippingAddressPopover}
                        onVisibleChange={(visible) =>
                          setVisibleShippingAddressPopover(visible)
                        }
                      >
                        <Button
                          type="link"
                          style={{
                            padding: 0,
                            color: "#5d5d8a",
                            margin: 0,
                            fontWeight: 400,
                            fontSize: '14px',
                          }}
                          className="btn-style"
                          disabled={levelOrder > 3}
                          onClick={() => setVisibleShippingAddressPopover(true)}
                        >
                          Thay đổi địa chỉ nhận hàng
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
                        disabled={levelOrder > 3}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Divider style={{ padding: 0, margin: 0 }} />

              <div className="send-order-box">
                <Row style={{ marginTop: 4 }}>
                  <Checkbox
                    className="checkbox-style"
                    onChange={ShowBillingAddress}
                    style={{ marginLeft: "3px" }}
                    disabled={levelOrder > 3}
                  >
                    Gửi hoá đơn
                  </Checkbox>
                </Row>

                {customer?.billing_addresses !== undefined && (
                  <Row
                    gutter={24}
                    style={{ paddingTop: 10 }}
                    hidden={!isVisibleBilling}
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
                        Địa chỉ gửi hóa đơn:
                      </div>
                      <Row className="customer-row-info">
                        <Col className="font-weight-500 pd-right" span={6}>
                          Họ tên:
                        </Col>
                        <Col className="word-break-fpage" span={18}>
                          {billingAddress?.name}
                        </Col>
                      </Row>
                      <Row className="customer-row-info">
                        <Col className="font-weight-500 pd-right" span={6}>
                          Số ĐT:
                        </Col>
                        <Col className="word-break-fpage" span={18}>
                          {billingAddress?.phone}
                        </Col>
                      </Row>
                      <Row className="customer-row-info">
                        <Col className="font-weight-500 pd-right" span={6}>
                          Địa chỉ:
                        </Col>
                        <Col className="word-break-fpage" span={18}>
                          {billingAddress?.full_address}
                        </Col>
                      </Row>

                      <Row>
                        <Popover
                          placement="bottomLeft"
                          overlayStyle={{ zIndex: 17 }}
                          title={
                            <Row
                              justify="space-between"
                              align="middle"
                              className="change-shipping-address-title"
                              style={{ width: "100%" }}
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
                                onClick={createBillingAddress}
                              >
                                Thêm địa chỉ mới
                              </Button>
                            </Row>
                          }
                          content={
                            <div className="change-shipping-address-content">
                              {customer?.billing_addresses?.map((item, index) => (
                                <div
                                  className="customer-shipping-address"
                                  key={index}
                                  onClick={() => handleTempBillingAddress(item)}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="shipping-address-row">
                                    <div className="shipping-address-name word-underline">
                                      Địa chỉ {index + 1}{" "}
                                      <Button
                                        type="text"
                                        onClick={() => {
                                          editBillingAddress(item);
                                        }}
                                        className="p-0"
                                      >
                                        <img src={editBlueIcon} alt="" />
                                      </Button>
                                      <Checkbox
                                        style={{ marginLeft: "auto" }}
                                        checked={item.default}
                                        onClick={(value) =>
                                          handleBillingAddressDefault(
                                            value,
                                            item
                                          )
                                        }
                                      />
                                    </div>
                                    <Row className="shipping-customer-address">
                                      <Col
                                        className="font-weight-500 pd-right"
                                        span={3}
                                      >
                                        Họ tên:
                                      </Col>
                                      <Col
                                        className="word-break-fpage"
                                        span={21}
                                      >
                                        {item.name}
                                      </Col>
                                    </Row>
                                    <Row className="shipping-customer-address">
                                      <Col
                                        className="font-weight-500 pd-right"
                                        span={3}
                                      >
                                        Số ĐT:
                                      </Col>
                                      <Col
                                        className="word-break-fpage"
                                        span={21}
                                      >
                                        {item.phone}
                                      </Col>
                                    </Row>
                                    <Row className="shipping-customer-address">
                                      <Col
                                        className="font-weight-500 pd-right"
                                        span={3}
                                      >
                                        Địa chỉ:
                                      </Col>
                                      <Col
                                        className="word-break-fpage"
                                        span={21}
                                      >
                                        {item.full_address}
                                      </Col>
                                    </Row>
                                  </div>
                                </div>
                              ))}
                            </div>
                          }
                          trigger="click"
                          className="change-shipping-address"
                          visible={isVisibleBillingAddressPopover}
                          onVisibleChange={(visible) =>
                            setVisibleBillingAddressPopover(visible)
                          }
                        >
                          <Button
                            type="link"
                            className="btn-style"
                            disabled={levelOrder > 3}
                            onClick={() =>
                              setVisibleBillingAddressPopover(true)
                            }
                          >
                            Thay đổi địa chỉ gửi hóa đơn
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
        customer={customer}
        handleChangeCustomer={handleChangeCustomer}
        formItem={modalSingleShippingAddress}
        visible={isVisibleAddress}
        modalAction={modalAction}
        onCancel={CancelConfirmAddress}
        onOk={OkConfirmAddress}
      />
      <EditCustomerModal
        areas={areas}
        wards={wards}
        groups={groups}
        formItem={customer}
        modalAction={modalAction}
        visible={isVisibleCustomer}
        districtId={districtId}
        handleChangeArea={handleChangeArea}
        handleChangeCustomer={handleChangeCustomer}
        onCancel={CancelConfirmCustomer}
      />
      <CustomerModal
        createBtnTitle="Tạo mới địa chỉ"
        updateBtnTitle="Lưu địa chỉ"
        visible={isShowModalShipping}
        onCreate={(formValue: CustomerShippingAddress) =>
          handleShippingAddressForm.create(formValue)
        }
        onEdit={(formValue: CustomerShippingAddress) =>
          handleShippingAddressForm.edit(formValue)
        }
        onDelete={() => { }}
        onCancel={() => setIsShowModalShipping(false)}
        modalAction={modalAction}
        modalTypeText="Địa chỉ giao hàng"
        componentForm={FormCustomerShippingAddress}
        formItem={modalSingleShippingAddress}
        deletedItemTitle={modalSingleShippingAddress?.name}
      />
      <CustomerModal
        createBtnTitle="Tạo mới địa chỉ"
        updateBtnTitle="Lưu địa chỉ"
        visible={isShowModalBilling}
        onCreate={(formValue: CustomerBillingAddress) =>
          handleBillingAddressForm.create(formValue)
        }
        onEdit={(formValue: CustomerBillingAddress) =>
          handleBillingAddressForm.edit(formValue)
        }
        onDelete={() => { }}
        onCancel={() => setIsShowModalBilling(false)}
        modalAction={modalAction}
        modalTypeText="Địa chỉ nhận hóa đơn"
        componentForm={FormCustomerBillingAddress}
        formItem={modalSingleBillingAddress}
        deletedItemTitle={modalSingleBillingAddress?.name}
      />
    </Card>
  );
};

export default CustomerCard;
