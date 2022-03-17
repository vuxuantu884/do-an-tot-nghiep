//#region Import
import { CloseOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  FormInstance,
  Input,
  Row,
  Space,
  Tag,
  Typography
} from "antd";
import imageDefault from "assets/icon/img-default.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import birthdayIcon from "assets/img/bithday.svg";
import callIcon from "assets/img/call.svg";
import pointIcon from "assets/img/point.svg";
import CustomSelect from "component/custom/select.custom";
import UrlConfig from "config/url.config";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction
} from "domain/actions/content/content.action";
import {
  CustomerGroups, CustomerSearchSo, DeleteShippingAddress, getCustomerDetailAction
} from "domain/actions/customer/customer.action";
import { changeOrderCustomerAction } from "domain/actions/order/order.action";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CustomerShippingAddress } from "model/request/customer.request";
import { OrderRequest } from "model/request/order.request";
import { SourceSearchQuery } from "model/request/source.request";
import {
  BillingAddress,
  CustomerResponse,
  ShippingAddress
} from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AddAddressModal from "screens/order-online/modal/add-address.modal";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import { departmentDetailApi } from "service/accounts/department.service";
import { getSourcesWithParamsService } from "service/order/order.service";
import { handleCalculateShippingFeeApplyOrderSetting, handleDelayActionWhenInsertTextInSearchInput, handleFetchApiError, isFetchApiSuccessful, sortSources, totalAmount } from "utils/AppUtils";
import * as CONSTANTS from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import CreateCustomer from "./CreateCustomer";
import UpdateCustomer from "./UpdateCustomer";
//#end region

type CustomerCardProps = {
  handleCustomer: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress|null) => void;
  BillingAddressChange: (items: BillingAddress|null) => void;
  setVisibleCustomer?: (item: boolean) => void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  isDisableSelectSource?: boolean;
  isVisibleCustomer: boolean;
  shippingAddress: ShippingAddress | any;
  setModalAction?: (item: modalActionType) => void;
  modalAction: modalActionType;
  setOrderSourceId?: (value: number) => void;
  OrderDetail?: OrderResponse | null;
  shippingAddressesSecondPhone?:string;
  setShippingAddressesSecondPhone?:(value:string)=>void;
  initialForm?: OrderRequest;
  initDefaultOrderSourceId?: number | null;
  isAutoDefaultOrderSource?: boolean;
  form: FormInstance<any>;
  setShippingFeeInformedToCustomer?:(value:number | null)=>void;
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
  search_type: "SIMPLE",
};

const CustomerCard: React.FC<CustomerCardProps> = (props: CustomerCardProps) => {
  const {
    customer,
    handleCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
    isDisableSelectSource = false,
    setVisibleCustomer,
    isVisibleCustomer,
    shippingAddress,
    setModalAction,
    modalAction,
    setOrderSourceId,
    OrderDetail,
    shippingAddressesSecondPhone,
    setShippingAddressesSecondPhone,
    initialForm,
    initDefaultOrderSourceId,
    isAutoDefaultOrderSource = true,
    setShippingFeeInformedToCustomer,
    form,
  } = props;
  //State
  // const [addressesForm] = Form.useForm();
  // const shippingWarRef: any = useRef(null);

  const orderLineItems = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.orderLineItems);

  const shippingServiceConfig = useSelector((state: RootReducerType) => state.orderReducer.shippingServiceConfig);

  const transportService = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service);

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
  const [initListSource, setInitListSource] = useState<Array<SourceResponse>>([]);

	const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);

  const [isVisibleShippingModal, setIsVisibleShippingModal] =
    React.useState<boolean>(false);

  let customerBirthday = moment(customer?.birthday).format("DD/MM/YYYY");
  const autoCompleteRef = useRef<any>(null);
  const autoCompleteElement: any = document.getElementById("search_customer");

  const [typingTimer, setTypingTimer] = useState(0);

	const sourceInputRef = useRef()
  //#region Modal
  const CancelConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmCustomerCreate = () => {
    if(setModalAction)setModalAction("create");
    if(setVisibleCustomer)setVisibleCustomer(true);
  };
  const OkConfirmCustomerEdit = () => {
    if(setModalAction)setModalAction("edit");
    if(setVisibleCustomer)setVisibleCustomer(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, autoCompleteElement, customer]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handlePressKeyBoards = (event: KeyboardEvent) => {
    let findCustomerInput = document.getElementById("search_customer");
    if (["F4"].indexOf(event.key) !== -1) {
      event.preventDefault();
      event.stopPropagation();
    }
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
			if(value.length >=3) {
				setSearchCustomer(true);
			} else {
				setSearchCustomer(false);
			}
      initQueryCustomer.request = value.trim();
      const handleSearch = () => {
				
        dispatch(CustomerSearchSo(initQueryCustomer, (response) => {
					setResultSearch(response);
					// if(response.length === 0) {
					// 	showError("Không tìm thấy khách hàng!")
					// }
				}));
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

  const orderAmount = totalAmount(orderLineItems);

  //Delete customer
  const CustomerDeleteInfo = () => {
    handleCustomer(null);
    dispatch(changeOrderCustomerAction(null));
    props.ShippingAddressChange(null);
    if(setVisibleCustomer)setVisibleCustomer(false);
    handleCalculateShippingFeeApplyOrderSetting(null, orderAmount, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer)
    setKeySearchCustomer("");
    if(setShippingAddressesSecondPhone)
      setShippingAddressesSecondPhone("");
  };

  //#end region

	const handleSearchOrderSources = useCallback((value:string) => {
		if(value.length > 1) {
		 handleDelayActionWhenInsertTextInSearchInput(sourceInputRef, () => {
			 let query = {
					name: value,
          active: true,
			 }
			 getSourcesWithParamsService(query).then((response) => {
				 setListSource(response.data.items)
			 }).catch((error) => {
				 console.log('error', error)
			 })
		 })
		} else {
			setListSource(initListSource)
		}
	}, [initListSource]);

  const SearchCustomerSelect = useCallback(
    (value, o) => {
      let index: number = -1;
      index = resultSearch.findIndex(
        (customerResponse: CustomerResponse) =>
          customerResponse.id && customerResponse.id.toString() === value
      );
      if (index !== -1) {
        
        dispatch(
          getCustomerDetailAction(
            resultSearch[index].id,
            (data: CustomerResponse | null) => {
              if (data) {
                OkConfirmCustomerEdit();
                handleCustomer(data);
                dispatch(changeOrderCustomerAction(data));
                handleCalculateShippingFeeApplyOrderSetting(data?.city_id, orderAmount, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer)
              }
            }
          )
        );

        if (autoCompleteRef && autoCompleteRef.current && autoCompleteRef.current.blur)
          autoCompleteRef.current?.blur();
        setKeySearchCustomer("");
        if( setShippingAddressesSecondPhone)setShippingAddressesSecondPhone("");
       
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoCompleteRef, dispatch, resultSearch, customer]
  );
	useEffect(() => {
    const getDepartmentIds = async () => {
      let departmentId = userReducer.account?.account_jobs[0]?.department_id;
      let departmentIds:number[] = [];
      if(departmentId) {
        departmentIds.push(departmentId)
        departmentDetailApi(departmentId).then((response) => {
          if(isFetchApiSuccessful(response)) {
            departmentIds.push(response.data.parent_id);
          } else {
            handleFetchApiError(response, "Chi tiết phòng ban", dispatch)
          }
        })
      }
      return departmentIds;
    };
    const getOrderSources = async(departmentIds:number[]) => {
      let result:SourceResponse[]  = [];
      await getSourcesWithParamsService({
        limit: 30
      }).then(async response => {
        if(isFetchApiSuccessful(response)) {
          result= await sortSources(response.data.items, departmentIds)
          return result
        } else {
          handleFetchApiError(response, "Nguồn đơn hàng", dispatch)
        }
      })
      return result
    }
    const checkIfInitOrderSourceIncludesOrderDetailSource = (sources: SourceResponse[]) => {
      if(OrderDetail?.source_id === CONSTANTS.POS.source_id) {
        return false;
      }
      const init = initialForm?.source_id || OrderDetail?.source_id
      if(sources.some(single => single.id === init)) {
        return true;
      }
      return false;
    };
    const getOrderSourceByDepartmentId = async (departmentIds: number[]) => {
      let result: SourceResponse[] = [];
      if(departmentIds.length > 0) {
        await getOrderSources(departmentIds).then(async (response) => {
          result = response;
        });
      }
      let sortedSources =  result;
      let id = OrderDetail?.source_id || initialForm?.source_id;
      if(id && props.updateOrder ) {
        let sortedSourcesResult = sortedSources.filter(x =>x.name.toLowerCase() !== CONSTANTS.POS.source_code.toLowerCase());
        if(!checkIfInitOrderSourceIncludesOrderDetailSource(sortedSources)) {
          const query:SourceSearchQuery = {
            ids: [id],
            active: true,
          }
          await getSourcesWithParamsService(query).then((responseSource) => {
            if(isFetchApiSuccessful(responseSource)) {
              let items = responseSource.data.items;
              sortedSources = [...sortedSourcesResult, ...items]
              return sortedSources
            } else {
              handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch)
            }
          })

        }
        result = [...sortedSources];
        return result;
      } else {
        result = sortedSources.filter((x) => {
          return (
            x.name.toLowerCase() !== CONSTANTS.POS.source_code.toLowerCase() && x.active
          )
        });
        return result;
      }
    };
    const setDefaultOrderSource = async (sources: SourceResponse[]) => {
      let checkIfHasDefault = sources.find(source => source.default);
      if(checkIfHasDefault) {
        if(form && initialForm && !initialForm.source_id) {
          /**
            * tạm thời chưa dùng
            */
          // if(!initDefaultOrderSourceId) {
          //   form.setFieldsValue({
          //     source_id: checkIfHasDefault.id
          //   })

          // }
        }
        return sources;
      } else {
        let result = sources;
        const params:SourceSearchQuery = {
          page: 1,
          limit: 100,
          active: true
        }
        await getSourcesWithParamsService(params).then((response) => {
          if(isFetchApiSuccessful(response)) {
            const defaultOrderSource = response.data.items.find(single => single.default && single.name.toLowerCase() !== CONSTANTS.POS.source_code)
            if(defaultOrderSource) {
              result.push(defaultOrderSource);
              /**
                * tạm thời chưa dùng
                */
              // if(isAutoDefaultOrderSource) {
              //   if(initialForm && !initialForm.source_id) {
              //     if(!initDefaultOrderSourceId) {
              //       form?.setFieldsValue({
              //         source_id: defaultOrderSource.id
              //       })
    
              //     } else {
              //       form?.setFieldsValue({
              //         source_id: initDefaultOrderSourceId
              //       })
              //     }
              //   }
              // }
            }
          } else {
            handleFetchApiError(response, "Nguồn đơn hàng", dispatch)
          }
        });
        return result;    

      }
    };
    const fetchData = async() => {
      let result: SourceResponse[] = [];
      let departmentIds= await getDepartmentIds();
      result = await getOrderSourceByDepartmentId(departmentIds);
      result = await setDefaultOrderSource(result);
      setInitListSource(result);
      setListSource(result);
    };
    fetchData()
  }, [OrderDetail?.source_id, dispatch, form, initDefaultOrderSourceId, initialForm, isAutoDefaultOrderSource, props.updateOrder, userReducer.account?.account_jobs]);

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
		
	}, [dispatch, userReducer.account?.account_jobs])

  useEffect(() => {
    if (customer) setDistrictId(customer.district_id);
  }, [customer]);
	

  const handleChangeArea = (districtId: string | null) => {
    if (districtId) {

      setDistrictId(districtId);
    }
  };

  const handleChangeCustomer = (customers: any) => {
    if (customers) {
      OkConfirmCustomerEdit();
      handleCustomer(customers);
      dispatch(changeOrderCustomerAction(customers));
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

  const renderSelectOrderSource = () => {
		return(
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
          allowClear
          showSearch
          onSearch={handleSearchOrderSources}
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
          }}
          disabled={isDisableSelectSource}
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
		)
	};

  const renderInfoOrderSource=()=>{
    return(
      <div className="d-flex align-items-center form-group-with-search">
          <span
            style={{
              float: "left",
              lineHeight: "40px",
            }}
          >
            <span style={{ marginRight: "10px" }}>Nguồn:</span>
            <span className="text-error">
              <span style={{ color: "red" }}>{props.OrderDetail?.source}</span>
            </span>
          </span>
        </div>
    )
  }

  const rankName = loyaltyUsageRules.find(
    (x) =>
      x.rank_id ===
      (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
  )?.rank_name;

  return (
    <Card
      title="THÔNG TIN KHÁCH HÀNG"
      extra={ OrderDetail? ((OrderDetail.source?.toLocaleLowerCase()===CONSTANTS.POS.source.toLocaleLowerCase() || props.updateOrder)
        ?renderSelectOrderSource():renderInfoOrderSource()) 
        : renderSelectOrderSource()
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
            <Divider  style={{ padding: 0, marginBottom: 0 }} />
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
                shippingAddressesSecondPhone={shippingAddressesSecondPhone}
                setShippingAddressesSecondPhone={setShippingAddressesSecondPhone}
                setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                form={form}
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
        areas={areas}
        handleChangeCustomer={handleChangeCustomer}
        formItem={singleShippingAddress}
        visible={isVisibleAddress}
        modalAction={modalActionShipping}
        onCancel={CancelConfirmAddress}
        onOk={OkConfirmAddress}
        setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
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
