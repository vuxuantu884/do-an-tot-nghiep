/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
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
import imageDefault from "assets/icon/img-default.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import editBlueIcon from "assets/img/edit_icon.svg";
import noteCustomer from "assets/img/note-customer.svg";
import pointIcon from "assets/img/point.svg";
import addressIcon from "assets/img/user-pin.svg";
import CustomSelect from "component/custom/select.custom";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CustomerDetail,
  CustomerGroups,
  CustomerSearch,
  DeleteShippingAddress,
} from "domain/actions/customer/customer.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerShippingAddress } from "model/request/customer.request";
import {
  BillingAddress,
  CustomerResponse,
  shippingAddress,
  ShippingAddress,
} from "model/response/customer/customer.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AddAddressModal from "screens/order-online/modal/add-address.modal";
import EditCustomerModal from "screens/order-online/modal/edit-customer.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import { showError, showSuccess } from "utils/ToastUtils";
import CustomerShippingAddressOrder from "./customer-shipping";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import UrlConfig from "config/url.config";
//#end region

type CustomerCardProps = {
  handleCustomer: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
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
  customer_level_id: null,
  responsible_staff_code: null,
};

const CustomerCard: React.FC<CustomerCardProps> = (
  props: CustomerCardProps
) => {
  const {
    customer,
    handleCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
  } = props;
  //State
  console.log("customer customer", customer);

  const dispatch = useDispatch();
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
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);

  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = useRef<any>(null);
  const autoCompleteElement:any = document.getElementById("search_customer");

  const [timeRef, setTimeRef] = React.useState<any>();
  const [typingTimer,setTypingTimer]= useState(0);

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

  const ShowAddressModalAdd = () => {
    setModalAction("create");
    setVisibleAddress(true);
  };

  const ShowAddressModalEdit = () => {
    setModalAction("edit");
    setVisibleAddress(true);
  };

  const showAddressModalDelete = () => {
    setIsVisibleShippingModal(true);
  };

  const onCancelShippingDelete = () => {
    setIsVisibleShippingModal(false);
  };

  const onOkShippingDelete = () => {
    handleShippingAddressDelete();
    setIsVisibleShippingModal(false);
  };

  const event =useCallback((event: KeyboardEvent)=>{
    if (event.target instanceof HTMLInputElement) {
      if (event.keyCode === 13 && event.target.id==="search_customer") 
      {
          setTypingTimer(5000);
          const initQueryCustomer: any = {
              request: "",
              limit: 5,
              page: 1,
          };

          if(autoCompleteRef.current?.props.value){
            initQueryCustomer.request = autoCompleteRef.current?.props.value;
            dispatch(CustomerSearch(initQueryCustomer, (data:Array<CustomerResponse>)=>{
              if(data && data.length!==0)
              {
                handleCustomer(data[0]);
                //set Shipping Address
                if (data[0].shipping_addresses) {
                  data[0].shipping_addresses.forEach((item, index2) => {
                    if (item.default === true) {
                      setShippingAddress(item);
                      props.ShippingAddressChange(item);
                    }
                  });
                }

                //set Billing Address
                if (data[0].billing_addresses) {
                  data[0].billing_addresses.forEach((item, index2) => {
                    if (item.default === true) {
                      props.BillingAddressChange(item);
                    }
                  });
                }    
              }
              else{
                showError("Không tìm thấy khách hàng từ hệ thống");
              }
              setKeySearchCustomer("");
            }));
          }
      }
  }
  },[dispatch,autoCompleteElement, customer]);

  useEffect(() => {
    window.addEventListener("keydown", event);
}, [event]);

  //#end region

  //#region Search and Render result
  //Search and render customer by name, phone, code
  const CustomerChangeSearch = useCallback(
    (value) => {

      clearTimeout(timeRef);
      setKeySearchCustomer(value);
      let time = setTimeout(() => {
          initQueryCustomer.request = value.trim();
          dispatch(CustomerSearch(initQueryCustomer, setResultSearch));
      }, typingTimer);
      setTimeRef(time);
      setTypingTimer(3000);
    },
    [dispatch, timeRef, typingTimer, setTypingTimer]
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
    handleCustomer(null);
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
        handleCustomer(resultSearch[index]);

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
        console.log(autoCompleteElement.value);
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
    if (customer && customer.shipping_addresses[0]) {
      const addressDefault = customer.shipping_addresses.filter(
        (item) => item.default
      );
      setShippingAddress(
        addressDefault.length
          ? addressDefault[0]
          : customer.shipping_addresses[0]
      );
    }
  }, [customer]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
    }
  };

  const handleChangeCustomer = (customers: any) => {
    if (customers) {
      handleCustomer(customers);
    }
  };

  const handleShippingAddressDelete = () => {
    if (singleShippingAddress) {
      if (customer)
        dispatch(
          DeleteShippingAddress(
            singleShippingAddress.id,
            customer.id,
            (data: shippingAddress) => {
              dispatch(
                CustomerDetail(customer.id, (datas: CustomerResponse) => {
                  handleChangeCustomer(datas);
                })
              );
              data
                ? showSuccess("Xóa địa chỉ thành công")
                : showError("Xóa địa chỉ thất bại");
            }
          )
        );
    }
  };

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id ===
      (loyaltyPoint?.loyalty_level_id === null
        ? 0
        : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

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
                <Link
                  target="_blank"
                  to={`${UrlConfig.CUSTOMER}/${customer.id}`}
                  className="primary"
                  style={{ fontSize: "16px" }}
                >
                  {customer.full_name}
                </Link>{" "}
                {levelOrder < 3 && (
                  <CloseOutlined
                    onClick={CustomerDeleteInfo}
                    style={{ marginRight: "5px" }}
                  />
                )}
                <Tag className="orders-tag orders-tag-vip">
                  <b>{!rankName ? "Default" : rankName}</b>
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
                    {loyaltyPoint?.point === undefined
                      ? "0"
                      : loyaltyPoint?.point}
                  </Typography.Text>
                </span>
              </Space>

              {customer?.birthday !== null && (
                <Space className="customer-detail-birthday">
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
                </Space>
              )}

              <Space className="customer-detail-action">
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
                            <Button type="link" onClick={ShowAddressModalAdd}>
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          // <div className="change-shipping-address-content">
                          //   {customer.shipping_addresses.map((item, index) => (
                          //     <div
                          //       className="shipping-address-row"
                          //       key={item.id}
                          //       // onClick={(e) =>
                          //       //   SelectShippingAddress(item)
                          //       // }
                          //     >
                          //       <div className="shipping-address-name">
                          //         Địa chỉ 1{" "}
                          //         <Button
                          //           type="text"
                          //           onClick={ShowAddressModal}
                          //           className="p-0"
                          //         >
                          //           <img src={editBlueIcon} alt="" />
                          //         </Button>
                          //       </div>
                          //       <div className="shipping-customer-name">
                          //         {item.name}
                          //       </div>
                          //       <div className="shipping-customer-mobile">
                          //         {item.phone}
                          //       </div>
                          //       <div className="shipping-customer-address">
                          //         {item.full_address}
                          //       </div>
                          //     </div>
                          //   ))}
                          // </div>
                          <CustomerShippingAddressOrder
                            customer={customer}
                            handleChangeCustomer={handleChangeCustomer}
                            handleShippingEdit={ShowAddressModalEdit}
                            handleShippingDelete={showAddressModalDelete}
                            handleSingleShippingAddress={
                              setSingleShippingAddress
                            }
                            handleShippingAddress={setShippingAddress}
                          />
                        }
                        trigger="click"
                        className="change-shipping-address"
                      >
                        <Button
                          type="link"
                          className="btn-style"
                          disabled={levelOrder > 3}
                        >
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
                        disabled={levelOrder > 3}
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
                    disabled={levelOrder > 3}
                  >
                    Gửi hoá đơn
                  </Checkbox>
                </Row>

                {customer.billing_addresses !== undefined && (
                  <Row gutter={24} hidden={!isVisibleBilling}>
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
                              <Button type="link" onClick={ShowAddressModalAdd}>
                                Thêm địa chỉ mới
                              </Button>
                            </Row>
                          }
                          content={
                            // <div className="change-shipping-address-content">
                            //   {customer.shipping_addresses.map(
                            //     (item, index) => (
                            //       <div
                            //         className="shipping-address-row"
                            //         key={item.id}
                            //         // onClick={(e) =>
                            //         //   SelectShippingAddress(item)
                            //         // }
                            //       >
                            //         <div className="shipping-address-name">
                            //           Địa chỉ 1{" "}
                            //           <Button
                            //             type="text"
                            //             onClick={ShowAddressModal}
                            //             className="p-0"
                            //           >
                            //             <img src={editBlueIcon} alt="" />
                            //           </Button>
                            //         </div>
                            //         <div className="shipping-customer-name">
                            //           {item.name}
                            //         </div>
                            //         <div className="shipping-customer-mobile">
                            //           {item.phone}
                            //         </div>
                            //         <div className="shipping-customer-address">
                            //           {item.full_address}
                            //         </div>
                            //       </div>
                            //     )
                            //   )}
                            // </div>
                            <CustomerShippingAddressOrder
                              customer={customer}
                              handleChangeCustomer={handleChangeCustomer}
                              handleShippingEdit={ShowAddressModalEdit}
                              handleShippingDelete={showAddressModalDelete}
                              handleSingleShippingAddress={
                                setSingleShippingAddress
                              }
                              handleShippingAddress={setShippingAddress}
                            />
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
                      <Form.Item name="email_note">
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
        formItem={singleShippingAddress}
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
      <SaveAndConfirmOrder
        onCancel={onCancelShippingDelete}
        onOk={onOkShippingDelete}
        visible={isVisibleShippingModal}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
        text="Bạn có chắc chắn xóa địa chỉ giao hàng này không?"
        icon={DeleteIcon}
      />
    </Card>
  );
};

export default CustomerCard;
