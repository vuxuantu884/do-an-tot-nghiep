/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
import { CloseOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
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
  getCustomerDetailAction,
  CustomerGroups,
  DeleteShippingAddress,
  CustomerSearchSo,
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import AddAddressModal from "screens/order-online/modal/add-address.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import { showError, showSuccess } from "utils/ToastUtils";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import UrlConfig from "config/url.config";
import * as CONSTANTS from "utils/Constants";
import UpdateCustomer from "./UpdateCustomer";
import CreateCustomer from "./CreateCustomer";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
//#end region

type CustomerCardProps = {
  handleCustomer: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress) => void;
  BillingAddressChange: (items: BillingAddress) => void;
  setVisibleCustomer: (item: boolean) => void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  isVisibleCustomer: boolean;
  shippingAddress: ShippingAddress | any;
  setModalAction: (item: modalActionType) => void;
  modalAction: modalActionType;
  setOrderSourceId?: (value: number) => void;
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
  customer_type_ids: [],
  customer_group_ids: [],
  customer_level_id: undefined,
  responsible_staff_codes: null,
  search_type:"SIMPLE",
};

const CustomerCard: React.FC<CustomerCardProps> = (props: CustomerCardProps) => {
  const {
    customer,
    handleCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
    setVisibleCustomer,
    isVisibleCustomer,
    shippingAddress,
    setModalAction,
    modalAction,
    setOrderSourceId,
  } = props;
  //State
  // const [addressesForm] = Form.useForm();
  // const shippingWarRef: any = useRef(null);

  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  // const [isVisibleBilling, setVisibleBilling] = useState(false);
  // const [isVisibleCustomer, setVisibleCustomer] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);

  const [countryId] = React.useState<number>(233);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [groups, setGroups] = React.useState<Array<any>>([]);

  const [modalActionShipping, setModalActionShipping] =
    useState<modalActionType>("create");

  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  // const [shippingAddress, setShippingAddress] =
  //   useState<ShippingAddress | null>(null);

  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = useRef<any>(null);
  const autoCompleteElement: any = document.getElementById("search_customer");

  //const [timeRef, setTimeRef] = React.useState<any>();
  const [typingTimer, setTypingTimer] = useState(0);

  //#region Modal
  // const ShowBillingAddress = (e: any) => {
  //   setVisibleBilling(e.target.checked);
  // };
  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmCustomerCreate = () => {
    setModalAction("create");
    setVisibleCustomer(true);
    //setKeySearchCustomer("");
  };
  const OkConfirmCustomerEdit = () => {
    setModalAction("edit");
    setVisibleCustomer(true);
  };

  const ShowAddressModalAdd = () => {
    setModalActionShipping("create");
    setVisibleAddress(true);
  };

  const ShowAddressModalEdit = () => {
    setModalActionShipping("edit");
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

          if (autoCompleteRef.current?.props && autoCompleteRef.current?.props.value) {
            initQueryCustomer.request = autoCompleteRef.current?.props.value;
            dispatch(
              CustomerSearchSo(initQueryCustomer, (data: Array<CustomerResponse>) => {
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
              })
            );
          }
        }
      }
    },
    [dispatch, autoCompleteElement, customer]
  );

  const handlePressKeyBoards = (event: KeyboardEvent) => {
    let findCustomerInput = document.getElementById("search_customer");
    if (["F4"].indexOf(event.key) !== -1) {
      event.preventDefault();
      event.stopPropagation();
    }
    //if (event.target instanceof HTMLBodyElement) {
    switch (event.key) {
      case "F4":
        findCustomerInput?.focus()
        break;
      default:
        break;
    }
    return;
  };

  useEffect(() => {
    window.addEventListener("keydown", event);
    window.addEventListener("keydown", handlePressKeyBoards);
    return () => {
      window.removeEventListener("keypress", event);
      window.removeEventListener("keydown", handlePressKeyBoards);
    };
  }, [event, handlePressKeyBoards]);

  //#end region

  //#region Search and Render result
  //Search and render customer by name, phone, code

  const CustomerChangeSearch = useCallback(
    (value) => {
      setKeySearchCustomer(value);
      setSearchCustomer(true);
      initQueryCustomer.request = value.trim();
      const handleSearch = () => {
        dispatch(CustomerSearchSo(initQueryCustomer, setResultSearch));
        setSearchCustomer(false);
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => handleSearch());
    },
    [dispatch, typingTimer, setTypingTimer]
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
    console.log("resultSearch", resultSearch);
    if (resultSearch.length > 0) {
      resultSearch.forEach((item: CustomerResponse, index: number) => {
        options.push({
          label: CustomerRenderSearchResult(item),
          value: item.id ? item.id.toString() : "",
        });
      });

    }
    return options;
  }, [dispatch, resultSearch]);

  //Delete customer
  const CustomerDeleteInfo = () => {
    handleCustomer(null);
    setVisibleCustomer(false);
    setKeySearchCustomer("");
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
        dispatch(
          getCustomerDetailAction(
            resultSearch[index].id,
            (data: CustomerResponse | null) => {
              handleCustomer(data);

              //set Shipping Address
              if (data?.shipping_addresses) {
                data.shipping_addresses.forEach((item, index2) => {
                  if (item.default === true) {
                    props.ShippingAddressChange(item);
                  }
                });
              }

              //set Billing Address
              if (data?.billing_addresses) {
                data?.billing_addresses.forEach((item, index2) => {
                  if (item.default === true) {
                    props.BillingAddressChange(item);
                  }
                });
              }
            }
          )
        );

        if (autoCompleteRef && autoCompleteRef.current && autoCompleteRef.current.blur)
          autoCompleteRef.current?.blur();
        setKeySearchCustomer("");
        if (resultSearch[index].district_id) {
          console.log("districtId",resultSearch[index].district_id)
          setDistrictId(resultSearch[index].district_id);
        }
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

  // useEffect(() => {
  //   if (customer) setDistrictId(customer.district_id);
  //   console.log("0974676818")
  // }, [customer]);

  const handleChangeArea = (districtId: string | null) => {
    if (districtId) {
      
      setDistrictId(districtId);
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
                getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
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
      (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
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
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
              onChange={(value) => {
                setOrderSourceId && setOrderSourceId(value);
                console.log(value)
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
                keySearchCustomer.length >= 3 ? "Không tìm thấy khách hàng" : undefined
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
              defaultActiveFirstOption
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
            <Row align="middle" justify="space-between" className="row-customer-detail">
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
                  <b>{!rankName ? "Không có hạng" : rankName}</b>
                </Tag>
              </Space>
              <Space className="customer-detail-phone">
                <span className="customer-detail-icon">
                  <img src={callIcon} alt="" className="icon-customer-info" />
                </span>
                <a
                  className="customer-detail-text text-body primary"
                  style={{ color: "#5656A2" }}
                  href={`tel:${customer?.phone === undefined ? "0987654321" : customer?.phone
                    }`}
                >
                  {" "}
                  {customer?.phone === undefined ? "0987654321" : customer?.phone}
                </a>
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
                    {loyaltyPoint?.point === undefined ? "0" : loyaltyPoint?.point}
                  </Typography.Text>
                </span>
              </Space>

              <Space className="customer-detail-birthday">
                <span className="customer-detail-icon">
                  <img src={birthdayIcon} alt="" className="icon-customer-info" />
                </span>
                <span className="customer-detail-text">
                  {customer?.birthday !== null ? customerBirthday : "Không xác định"}
                </span>
              </Space>

              {levelOrder < 3 && (
                <Space className="customer-detail-action">
                  <CloseOutlined
                    onClick={CustomerDeleteInfo}
                    style={{ marginRight: "5px" }}
                  />
                </Space>
              )}
            </Row>
            <Divider className="margin-0" style={{ padding: 0, marginBottom: 0 }} />
          </div>
        )}
      </div>
      {isVisibleCustomer === true && (
        <div>
          <div style={{ marginTop: "14px" }}>
            {modalAction === CONSTANTS.MODAL_ACTION_TYPE.create && (
              <CreateCustomer
                areas={areas}
                wards={wards}
                groups={groups}
                handleChangeArea={handleChangeArea}
                handleChangeCustomer={handleChangeCustomer}
                ShippingAddressChange={props.ShippingAddressChange}
                keySearchCustomer={keySearchCustomer}
                CustomerDeleteInfo={CustomerDeleteInfo}
              />
            )}

            {modalAction === CONSTANTS.MODAL_ACTION_TYPE.edit && customer !== null && (
              <UpdateCustomer
                levelOrder={levelOrder}
                areas={areas}
                wards={wards}
                groups={groups}
                customerItem={customer}
                shippingAddress={shippingAddress}
                handleChangeArea={handleChangeArea}
                handleChangeCustomer={handleChangeCustomer}
                setSingleShippingAddress={setSingleShippingAddress}
                ShippingAddressChange={props.ShippingAddressChange}
                ShowAddressModalEdit={ShowAddressModalEdit}
                showAddressModalDelete={showAddressModalDelete}
                ShowAddressModalAdd={ShowAddressModalAdd}
              />
            )}

            {/* <EditCustomerModal
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
                  /> */}
          </div>
        </div>
      )}

      <AddAddressModal
        customer={customer}
        handleChangeCustomer={handleChangeCustomer}
        formItem={singleShippingAddress}
        visible={isVisibleAddress}
        modalAction={modalActionShipping}
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
