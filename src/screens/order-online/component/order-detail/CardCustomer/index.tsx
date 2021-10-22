/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
import {
  CloseOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
  MailOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
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
  Select,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import imageDefault from "assets/icon/img-default.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
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
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import UrlConfig from "config/url.config";
import * as CONSTANTS from "utils/Constants";
//#end region

type CustomerCardProps = {
  handleCustomer: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  setVisibleCustomer:(item:boolean)=>void;
  setModalAction:(item:modalActionType)=>void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  isVisibleCustomer:boolean;
  modalAction:modalActionType;
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
    setModalAction,
    modalAction,
    setVisibleCustomer,
    isVisibleCustomer
  } = props;
  //State
  const [addressesForm] = Form.useForm();
  const shippingWarRef: any = useRef(null);

  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleBilling, setVisibleBilling] = useState(false);
  // const [isVisibleCustomer, setVisibleCustomer] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);

  const [countryId] = React.useState<number>(233);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [groups, setGroups] = React.useState<Array<any>>([]);

  //Shipping
  const [shippingDistrictId, setShippingDistrictId] = React.useState<any>(null);
  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>(
    []
  );

  // const [modalAction, setModalAction] = useState<modalActionType>("edit");
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  // const [shippingAddress, setShippingAddress] =
  //   useState<ShippingAddress | null>(null);

  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] =
    useState(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = useRef<any>(null);
  const autoCompleteElement: any = document.getElementById("search_customer");

  const [timeRef, setTimeRef] = React.useState<any>();
  const [typingTimer, setTypingTimer] = useState(0);

  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(false);

  //element
  const btnUpdateCustomerElement = document.getElementById("btnUpdateCustomer");

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

  const event = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        if (event.keyCode === 13 && event.target.id === "search_customer") {
          setTypingTimer(5000);
          const initQueryCustomer: any = {
            request: "",
            limit: 5,
            page: 1,
          };

          if (autoCompleteRef.current?.props.value) {
            initQueryCustomer.request = autoCompleteRef.current?.props.value;
            dispatch(
              CustomerSearch(
                initQueryCustomer,
                (data: Array<CustomerResponse>) => {
                  if (data && data.length !== 0) {
                    handleCustomer(data[0]);
                    //set Shipping Address
                    if (data[0].shipping_addresses) {
                      data[0].shipping_addresses.forEach((item, index2) => {
                        if (item.default === true) {
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
                  } else {
                    showError("Không tìm thấy khách hàng từ hệ thống");
                  }
                  setKeySearchCustomer("");
                }
              )
            );
          }
        }
      }
    },
    [dispatch, autoCompleteElement, customer]
  );

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
      setSearchCustomer(true);
      let time = setTimeout(() => {
        initQueryCustomer.request = value.trim();
        dispatch(CustomerSearch(initQueryCustomer, setResultSearch));
        setSearchCustomer(false);
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
    setVisibleCustomer(false);
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
        OkConfirmCustomerEdit();
        handleCustomer(resultSearch[index]);

        //set Shipping Address
        if (resultSearch[index].shipping_addresses) {
          resultSearch[index].shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
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
    if (shippingDistrictId) {
      dispatch(WardGetByDistrictAction(shippingDistrictId, setShippingWards));
    }
  }, [dispatch, shippingDistrictId]);

  useEffect(() => {
    dispatch(CustomerGroups(setGroups));
  }, [dispatch]);

  useEffect(()=>{
      if(customer)
        setDistrictId(customer.district_id);
  },[customer]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
    }
  };

  const handleShippingChangeArea = (districtId: string) => {
    if (districtId) {
      setShippingDistrictId(districtId);
      if (shippingWarRef.current) shippingWarRef.current.value = null;
    }
  };

  const handleChangeCustomer = (customers: any) => {
    if (customers) {
      OkConfirmCustomerEdit();
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
            (data: ShippingAddress) => {
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

  const DefaultWard = () => {
    let value = addressesForm.getFieldsValue();
    value.ward_id = null;
    addressesForm.setFieldsValue(value);
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
      title="THÔNG TIN KHÁCH HÀNG"
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
            style={{ margin: "0px" }}
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
      {customer === null && isVisibleCustomer !== true && (
        <div>
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
                prefix={
                  searchCustomer ? (
                    <LoadingOutlined style={{ color: "#2a2a86" }} />
                  ) : (
                    <SearchOutlined style={{ color: "#ABB4BD" }} />
                  )
                }
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
              className="row-customer-detail"
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
                </Link>
                <Tag className="orders-tag orders-tag-vip">
                  <b>{!rankName ? "Default" : rankName}</b>
                </Tag>
              </Space>
              <Space className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" className="icon-customer-info" />
                </span>
                <a className="customer-detail-text text-body primary" style={{color:"#5656A2"}} href={`tel:${customer?.phone === undefined? "0987654321": customer?.phone}`}>0965143608</a>
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

              <Space className="customer-detail-birthday">
                <span className="customer-detail-icon">
                  <img
                    src={birthdayIcon}
                    alt=""
                    className="icon-customer-info"
                  />
                </span>
                <span className="customer-detail-text">
                  {customer?.birthday !== null
                    ? customerBirthday
                    : "Không xác định"}
                </span>
              </Space>

              {levelOrder < 3 && <Space className="customer-detail-action">
                <CloseOutlined
                  onClick={CustomerDeleteInfo}
                  style={{ marginRight: "5px" }}
                />
              </Space>}
            </Row>
            <Divider
              className="margin-0"
              style={{ padding: 0, marginBottom: 0 }}
            />
          </div>
        )}
      </div>
      {(isVisibleCustomer === true || customer !== null) && (
        <div>
          <div>
            {isVisibleCustomer === true && (
              <div>
                <div style={{ marginTop: "14px" }}>
                  <EditCustomerModal
                    areas={areas}
                    wards={wards}
                    groups={groups}
                    formItem={customer}
                    modalAction={modalAction}
                    isVisibleCollapseCustomer={isVisibleCollapseCustomer}
                    districtId={districtId}
                    handleChangeArea={handleChangeArea}
                    handleChangeCustomer={handleChangeCustomer}
                    onCancel={CustomerDeleteInfo}
                    ShowAddressModalAdd={ShowAddressModalAdd}
                    ShowAddressModalEdit={ShowAddressModalEdit}
                    showAddressModalDelete={showAddressModalDelete}
                    setSingleShippingAddress={setSingleShippingAddress}
                    setVisibleCollapseCustomer={setVisibleCollapseCustomer}
                    setVisibleBtnUpdate={setVisibleBtnUpdate}
                    ShippingAddressChange={props.ShippingAddressChange}
                  />
                </div>
                {isVisibleCollapseCustomer === true && (
                  <Divider orientation="left" style={{ padding: 0, margin: 0,color:"#5656A1" }}>
                      <div>
                          <Button
                            type="link"
                            icon={<UpOutlined />}
                            style={{ padding: "0px" }}
                            onClick={() => {
                              setVisibleCollapseCustomer(false);
                            }}
                          >
                            Thu gọn
                          </Button>
                      </div>
                    </Divider>
                  )}
              </div>
            )}
          </div>

          <div>
            {customer === null &&(
               <div className="send-order-box">
                 <Row style={{ marginTop: 15 }}>
                  <Col md={24} style={{float:"right",marginTop: "-10px"}}>
                  { isVisibleBtnUpdate === true &&  (
                     <Button
                      type="primary"
                      style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={()=>{
                        console.log("btnUpdateCustomerElement",btnUpdateCustomerElement)
                        btnUpdateCustomerElement?.click();
                      }}
                      >
                        {modalAction=== CONSTANTS.MODAL_ACTION_TYPE.create?"Thêm mới" : "Cập nhập"}
                      </Button>
                    )}
                  </Col>
                </Row>
               </div>
            )}
            {customer !== null && (
              <div className="send-order-box">
                <Row gutter={12} style={{ marginTop: 15 }}>
                  <Col md={12}>
                    <Checkbox
                      className="checkbox-style"
                      onChange={ShowBillingAddress}
                      style={{ marginLeft: "3px" }}
                      disabled={levelOrder > 3}
                    >
                      Gửi hoá đơn
                    </Checkbox>
                  </Col>
                  <Col md={12} style={{float:"right",marginTop: "-10px"}}>
                  { isVisibleBtnUpdate === true&& !isVisibleBilling  && (
                     <Button
                      type="primary"
                      style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={()=>{
                        console.log("btnUpdateCustomerElement",btnUpdateCustomerElement)
                        btnUpdateCustomerElement?.click();
                      }}
                      >
                         {modalAction=== CONSTANTS.MODAL_ACTION_TYPE.create?"Thêm mới" : "Cập nhập"}
                      </Button>
                    )}
                  </Col>
                </Row>

                {customer.billing_addresses !== undefined && (
                  <Row
                    gutter={24}
                    hidden={!isVisibleBilling}
                    style={{ marginTop: "14px" }}
                  >
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="district_id"
                        //label="Khu vực"
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Vui lòng chọn khu vực",
                        //   },
                        // ]}
                      >
                        <Select
                          className="select-with-search"
                          showSearch
                          allowClear
                          placeholder={
                            <React.Fragment>
                              <EnvironmentOutlined style={{color:"#71767B"}}/>
                              <span> Chọn khu vực</span>
                            </React.Fragment>
                          }
                          style={{ width: "100%" }}
                          onChange={(value: any) => {
                            handleShippingChangeArea(value);
                            DefaultWard();
                          }}
                          optionFilterProp="children"
                        >
                          {areas.map((area: any) => (
                            <Select.Option key={area.id} value={area.id}>
                              {area.city_name + ` - ${area.name}`}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="ward_id"
                        //label="Phường xã"
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Vui lòng chọn phường/xã",
                        //   },
                        // ]}
                      >
                        <Select
                          className="select-with-search"
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          style={{ width: "100%" }}
                          placeholder={
                            <React.Fragment>
                              <EnvironmentOutlined style={{color:"#71767B"}}/>
                              <span> Chọn phường/xã</span>
                            </React.Fragment>
                          }
                          ref={shippingWarRef}
                        >
                          {shippingWards.map((ward: any) => (
                            <Select.Option key={ward.id} value={ward.id}>
                              {ward.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="full_address"
                        //label="Địa chỉ"
                      >
                        <Input
                          placeholder="Địa chỉ"
                          prefix={<EnvironmentOutlined style={{color:"#71767B"}}/>}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="email_note"
                        //label="Email"
                      >
                        <Input
                          placeholder="Điền email"
                          prefix={<MailOutlined style={{color:"#71767B"}}/>}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </div>
            )}

            {customer !== null && isVisibleBilling===true &&(
               <Row style={{ marginTop: 15 }}>
                <Col md={24} style={{float:"right",marginTop: "-10px"}}>
                { isVisibleBtnUpdate === true &&  (
                    <Button
                    type="primary"
                    style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
                    className="create-button-custom ant-btn-outline fixed-button"
                    onClick={()=>{
                      console.log("btnUpdateCustomerElement",btnUpdateCustomerElement)
                      btnUpdateCustomerElement?.click();
                    }}
                    >
                      {modalAction=== CONSTANTS.MODAL_ACTION_TYPE.create?"Thêm mới" : "Cập nhập"}
                    </Button>
                  )}
                </Col>
             </Row>
            )}
          </div>
        </div>
      )}

      <AddAddressModal
        customer={customer}
        handleChangeCustomer={handleChangeCustomer}
        formItem={singleShippingAddress}
        visible={isVisibleAddress}
        modalAction={modalAction}
        onCancel={CancelConfirmAddress}
        onOk={OkConfirmAddress}
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
