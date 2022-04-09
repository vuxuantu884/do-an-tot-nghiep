/* eslint-disable react-hooks/exhaustive-deps */
//#region Import
import {
  CloseOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
// import logoMobile from "assets/icon/logoMobile.svg";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Tag,
  Typography,
  FormInstance
} from "antd";
import imageDefault from "assets/icon/img-default.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import CustomSelect from "component/custom/select.custom";
import {
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  getCustomerDetailAction,
  CustomerSearch,
  DeleteShippingAddress,
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerShippingAddress, YDpageCustomerRequest } from "model/request/customer.request";
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
import AddAddressModal from "screens/yd-page/yd-page-order-create/modal/add-address.modal";
import SaveAndConfirmOrder from "screens/yd-page/yd-page-order-create/modal/save-confirm.modal";
import { showError, showSuccess } from "utils/ToastUtils";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import UrlConfig from "config/url.config";
import UpdateCustomer from "./UpdateCustomer";
import CreateCustomer from "./CreateCustomer";
import {formatCurrency, handleDelayActionWhenInsertTextInSearchInput} from "utils/AppUtils";
import { getSourcesWithParamsService } from "service/order/order.service";
import { debounce } from "lodash";
//#end region

type CustomerCardProps = {
  customerGroups: Array<any>;
  areaList:  Array<any>;
  setCustomer: (items: CustomerResponse | null) => void;
  setShippingAddress: (items: ShippingAddress | null) => void;
  setBillingAddress: (items: BillingAddress | null) => void;
  setVisibleCustomer: (item: boolean) => void;
  customer: CustomerResponse | null;
  newCustomerInfo?: YDpageCustomerRequest;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  isVisibleCustomer: boolean;
  shippingAddress: ShippingAddress | any;
  setModalAction: (item: modalActionType) => void;
  modalAction: modalActionType;
  setOrderSourceId?: (value: number) => void;
  defaultSourceId: number | null;
  form: FormInstance<any>;
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
};

const CustomerCard: React.FC<CustomerCardProps> = (props: CustomerCardProps) => {
  const {
    customerGroups,
    areaList,
    customer,
    newCustomerInfo,
    setCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
    setVisibleCustomer,
    isVisibleCustomer,
    shippingAddress,
    setModalAction,
    modalAction,
    setBillingAddress,
    setShippingAddress,
    setOrderSourceId,
    defaultSourceId,
    form,
  } = props;

  const dispatch = useDispatch();
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isShowSearchCustomer, setVisibleSearchCustomer] = useState(false);
  const [searchCustomer, setSearchCustomer] = useState(false);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  const [resultSearch, setResultSearch] = useState<Array<CustomerResponse>>([]);

  const [districtId, setDistrictId] = React.useState<any>(null);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [loadingWardList, setLoadingWardList] = React.useState<boolean>(false);

  const [modalActionShipping, setModalActionShipping] = useState<modalActionType>("create");
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = useRef<any>(null);
  const autoCompleteElement: any = document.getElementById("search_customer");
  const [typingTimer, setTypingTimer] = useState(0);

  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);
  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmCustomerCreate = () => {
    setModalAction("create");
    setVisibleCustomer(true);
    setVisibleSearchCustomer(false);
  };
  const OkConfirmCustomerEdit = () => {
    setModalAction("edit");
    setVisibleCustomer(true);
    setVisibleSearchCustomer(false);
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
                    setCustomer(data[0]);
                    //set Shipping Address
                    if (data[0].shipping_addresses) {
                      data[0].shipping_addresses.forEach((item) => {
                        if (item.default) {
                          props.setShippingAddress(item);
                        }
                      });
                    }

                    //set Billing Address
                    if (data[0].billing_addresses) {
                      data[0].billing_addresses.forEach((item) => {
                        if (item.default) {
                          props.setBillingAddress(item);
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
      setKeySearchCustomer(value);
      if(value.length >= 3) {
        setSearchCustomer(true);
      } else {
        setSearchCustomer(false);
      }
      initQueryCustomer.request = value.trim();
      const handleSearch = () => {
        dispatch(CustomerSearch(initQueryCustomer, setResultSearch));
        setSearchCustomer(false);
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => handleSearch());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              />{" "}
              <span style={{ color: "#737373" }}>{item.phone}</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomerConvertResultSearch = useMemo(() => {
    let options: any[] = [];
    if (resultSearch.length > 0) {
      resultSearch.forEach((item: CustomerResponse, index: number) => {
        options.push({
          label: CustomerRenderSearchResult(item),
          value: item.id ? item.id.toString() : "",
        });
      });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, resultSearch]);

  //Delete customer
  const CustomerDeleteInfo = () => {
    setCustomer(null);
    setShippingAddress(null);
    setBillingAddress(null)
    setVisibleCustomer(false);
    setVisibleSearchCustomer(true);
  };

  //#end region

  const SearchCustomerSelect = useCallback(
    (value) => {
      const customer: CustomerResponse | undefined = resultSearch?.find(item => item.id.toString() === value)
      if (customer) {
        OkConfirmCustomerEdit();
        setCustomer(customer);

        //set Shipping Address
        if (customer?.shipping_addresses) {
          customer.shipping_addresses.forEach((item) => {
            if (item.default) {
              props.setShippingAddress(item);
            }
          });
        } else {
          props.setShippingAddress(null);
        }

        //set Billing Address
        if (customer?.billing_addresses) {
          customer.billing_addresses.forEach((item) => {
            if (item.default) {
              props.setBillingAddress(item);
            }
          });
        } else {
          props.setBillingAddress(null);
        }

        if (autoCompleteRef && autoCompleteRef.current && autoCompleteRef.current.blur) {
          autoCompleteRef.current?.blur();
        }
        setKeySearchCustomer("");
        // setDistrictId(customer?.district_id);
      }
    },
    [autoCompleteRef, dispatch, resultSearch, customer]
  );

  // const listSources = useMemo(() => {
  //   return listSource.filter((item) => item.code !== "POS");
  // }, [listSource]);

  useEffect(() => {
    let defaultSourceIndex = listSource.findIndex(data => {
      return data.id === defaultSourceId;
    });
    if (defaultSourceIndex > -1) {
      form.setFieldsValue({ source_id: defaultSourceId })
    } else {
      form.setFieldsValue({ source_id: null })
    }
  }, [listSource]);

  useEffect(() => {
		if(!listSource) return
		if(!defaultSourceId) return

    let defaultSourceIndex = listSource.findIndex(data => {
      return data.id === defaultSourceId;
    });
    if (defaultSourceIndex < 0) {
			let query = {
				ids: [defaultSourceId]
			}
			getSourcesWithParamsService(query).then((response) => {
				setListSource(oldArray => [...oldArray, response.data.items[0]])
				form.setFieldsValue({ source_id: defaultSourceId })
			}).catch((error) => {
				console.log('error', error)
			})
    }
  }, [listSource, defaultSourceId]);

  useEffect(() => {
    let query = {
      name: '',
      active: true
    }
    getSourcesWithParamsService(query).then((response) => {
      setListSource(response.data.items)
      }).catch((error) => {
      console.log('error', error)
    })
  }, [dispatch]);

  useEffect(() => {
    if (districtId) {
      setLoadingWardList(true);
      dispatch(WardGetByDistrictAction(Number(districtId), (wardResponse) => {
        setWards(wardResponse);
        setLoadingWardList(false);
      }));
    } else {
      setWards([]);
    }
  }, [dispatch, districtId]);
	
  useEffect(() => {
    if (newCustomerInfo?.district_id) {
			setDistrictId(newCustomerInfo?.district_id);
    }
  }, [newCustomerInfo]);

  useEffect(() => {
    if (customer) {
      setDistrictId(customer.district_id);
    }
  }, [customer]);

  const handleChangeArea = (districtId: number) => {
    setDistrictId(districtId);
  };

  const handleChangeCustomer = (customers: any) => {
    if (customers) {
      OkConfirmCustomerEdit();
      setCustomer(customers);
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
      (loyaltyPoint?.loyalty_level_id === null
        ? 0
        : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

  function searchOrderSources(value:any) {
    let query = {
      name: value,
      active: true
    }
    getSourcesWithParamsService(query).then((response) => {
      setListSource(response.data.items)
      }).catch((error) => {
      console.log('error', error)
    })
          
  }
  const debounceSearchOrderSources = useCallback(debounce((nextValue) => searchOrderSources(nextValue), 800), [])
  
  const handleSearchOrderSources = (value: any) => {
    debounceSearchOrderSources(value);
  }

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
              allowClear
              showArrow
              showSearch
              placeholder="Nguồn đơn hàng"
              notFoundContent="Không tìm thấy kết quả"
              onSearch={handleSearchOrderSources}
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
              onChange={(value) => {
                setOrderSourceId && setOrderSourceId(value)
              }}
            >
              {listSource.map((item, index) => (
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
      {/*Tìm kiếm khách hàng*/}
      {(isShowSearchCustomer || (!customer && !isVisibleCustomer)) && (
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
      )}

      {/*Tạo mới khách hàng*/}
      {!isShowSearchCustomer && !customer && isVisibleCustomer && modalAction === "create" && (
        <CreateCustomer
          customerGroups={customerGroups}
          areaList={areaList}
          newCustomerInfo={newCustomerInfo}
          wards={wards}
          loadingWardList={loadingWardList}
          handleChangeArea={handleChangeArea}
          handleChangeCustomer={handleChangeCustomer}
          setShippingAddress={setShippingAddress}
          keySearchCustomer={keySearchCustomer}
          CustomerDeleteInfo={CustomerDeleteInfo}
          setBillingAddress={setBillingAddress}
        />
      )}

      {/*Thông tin khách hàng*/}
      {customer && (
        <div>
          <Row
            align="middle"
            justify="space-between"
            className="row-customer-detail"
            style={{ margin: "5px 0" }}>
            <Col style={{ display: "flex", alignItems: "center" }}>
              {levelOrder < 3 && (
                <CloseOutlined
                  style={{ color: "red", fontSize: 20, marginRight: 10 }}
                  onClick={CustomerDeleteInfo}
                />
              )}
              {/* <div className="fpage-order-avatar-customer">
                <img style={{ width: 34, height: 34 }} src={logoMobile} alt="logo" />
              </div> */}
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${customer?.id}`}
                className="primary"
                style={{ fontSize: "16px", margin: "0 10px", fontWeight: 500 }}
              >
                {customer?.full_name.toUpperCase()}
              </Link>{" "}

            </Col>
            <Col style={{ display: "flex", alignItems: "center" }}>
              <span className="customer-detail-icon">
                <img src={callIcon} alt="" />
              </span>
              <span
                className="customer-detail-text text-body"
                style={{ marginRight: "10px", fontWeight: 500, fontSize: 16 }}
              >
                {customer?.phone}
              </span>
            </Col>
          </Row>
          <Divider style={{ padding: 0, marginBottom: 6 }} />
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
                    : formatCurrency(loyaltyPoint.point || 0)}
                </Typography.Text>
              </span>
            </Col>
            <Col>
              <Tag className="orders-tag orders-tag-vip">
                <b>{!rankName ? "Không có hạng" : rankName}</b>
              </Tag>
            </Col>
            <Col className="customer-detail-birthday">
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
            </Col>
          </Row>
          <Divider style={{ padding: 0, marginBottom: 6 }} />
        </div>
      )}

      {/*Cập nhật thông tin giao hàng*/}
      {customer && (
        <UpdateCustomer
          customerGroups={customerGroups}
          areaList={areaList}
          levelOrder={levelOrder}
          wards={wards}
          customer={customer}
          shippingAddress={shippingAddress}
          handleChangeArea={handleChangeArea}
          handleChangeCustomer={handleChangeCustomer}
          setSingleShippingAddress={setSingleShippingAddress}
          setShippingAddress={setShippingAddress}
          ShowAddressModalEdit={ShowAddressModalEdit}
          showAddressModalDelete={showAddressModalDelete}
          ShowAddressModalAdd={ShowAddressModalAdd}
        />
      )}

      <AddAddressModal
        areaList={areaList}
        customer={customer}
				newCustomerInfo={newCustomerInfo}
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
