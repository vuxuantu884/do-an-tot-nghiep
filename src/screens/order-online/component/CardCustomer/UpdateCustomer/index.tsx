import {
  BarcodeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Popover,
  Row,
  Select,
  Spin,
} from "antd";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import {
  CustomerUpdateAction,
  getCustomerDetailAction,
  DeleteShippingAddress,
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  CustomerModel,
  CustomerRequest,
  CustomerShippingAddress,
} from "model/request/customer.request";
import { CustomerResponse, ShippingAddress } from "model/response/customer/customer.response";
import { OrderResponse } from "model/response/order/order.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SaveAndConfirmOrder from "screens/order-online/modal/save-confirm.modal";
import AddAddressModal from "screens/order-online/modal/add-address.modal";
import {
  findWard,
  getCustomerShippingAddress,
  handleCalculateShippingFeeApplyOrderSetting,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFindArea,
  totalAmount,
} from "utils/AppUtils";
import { GENDER_OPTIONS, VietNamId } from "utils/Constants";
import { textBodyColor } from "utils/global-styles/variables";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import CustomerShippingAddressOrder from "./customerShipping";
import DividerCustom from "./dividerCustom";
import { StyleComponent } from "./style";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { BillingAddressRequestModel, OrderBillRequestFormModel } from "model/request/order.request";
import DeleteOrderBillRequestConfirmModal from "../../OrderBillRequest/DeleteOrderBillRequestConfirmModal";
import OrderBillRequestModal from "../../OrderBillRequest/OrderBillRequestModal";
import OrderBillRequestButton from "../../OrderBillRequest/OrderBillRequestButton";

type Props = {
  areas: Array<any>;
  groups: Array<any>;
  orderDetail: OrderResponse | null | undefined;
  customer: CustomerResponse;
  shippingAddress: ShippingAddress | null | undefined;
  shippingAddressesSecondPhone?: string;
  customerChange: boolean;
  setCustomerChange: (value: boolean) => void;
  levelOrder?: number;
  setShippingAddressesSecondPhone?: (value: string) => void;
  handleChangeCustomer: (v: CustomerResponse | null) => void;
  form: FormInstance<any>;
  setShippingFeeInformedToCustomer: ((value: number | null) => void) | undefined;
  isOrderUpdate?: boolean;
  isPageOrderUpdate: boolean;
  billingAddress: BillingAddressRequestModel | null;
  setBillingAddress: (items: BillingAddressRequestModel | null) => void;
};

const UpdateCustomer: React.FC<Props> = (props: Props) => {
  const {
    areas,
    groups,
    orderDetail,
    customer,
    shippingAddress,
    shippingAddressesSecondPhone,
    setShippingAddressesSecondPhone,
    customerChange,
    setCustomerChange,
    levelOrder = 0,
    handleChangeCustomer,
    setShippingFeeInformedToCustomer,
    form,
    isOrderUpdate,
    isPageOrderUpdate,
    billingAddress,
    setBillingAddress,
  } = props;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRefCustomer = useRef<any>();
  const fullAddressRef = useRef();

  const [wards, setWards] = useState<Array<WardResponse>>([]);
  const [shippingWards, setShippingWards] = useState<Array<WardResponse>>([]);
  const [isVisibleOrderBillRequestModal, setIsVisibleOrderBillRequestModal] = useState(false);
  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [modalActionShipping, setModalActionShipping] = useState<modalActionType>("create");
  const [singleShippingAddress, setSingleShippingAddress] =
    useState<CustomerShippingAddress | null>(null);
  const [isVisibleShippingModal, setIsVisibleShippingModal] = React.useState<boolean>(false);
  const [orderBillId, setOrderBillId] = useState<number | null>(billingAddress?.order_id || null);

  const [
    isVisibleConfirmDeleteOrderBillRequestModal,
    setIsVisibleConfirmDeleteOrderBillRequestModal,
  ] = useState(false);

  const orderLineItems = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.orderLineItems,
  );

  const shippingServiceConfig = useSelector(
    (state: RootReducerType) => state.orderReducer.shippingServiceConfig,
  );

  const transportService = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service,
  );

  const disableInput = levelOrder >= 4 ? true : false;
  const initialFormValueShippingAddress = useMemo(() => {
    return customer
      ? {
          full_name: customer.full_name,
          district_id: customer.district_id,
          phone: customer.phone || "",
          ward_id: customer.ward_id,
          card_number: customer.card_number,
          full_address: customer.full_address,
          gender: customer.gender,
          birthday: customer.birthday ? moment(customer.birthday) : null,
          customer_group_id: customer.customer_group_id,

          shipping_addresses_card_number: customer.card_number,
          shipping_addresses_name: shippingAddress?.name,
          shipping_addresses_district_id: shippingAddress?.district_id,
          shipping_addresses_country_id: shippingAddress?.country_id,
          shipping_addresses_city_id: shippingAddress?.city_id,
          shipping_addresses_phone: shippingAddress?.phone || "",
          shipping_addresses_ward_id: shippingAddress?.ward_id,
          shipping_addresses_full_address: shippingAddress?.full_address,
          shipping_addresses_second_phone: shippingAddressesSecondPhone,
        }
      : {
          shipping_addresses__card_number: "",
          shipping_addresses_name: "",
          shipping_addresses_district_id: null,
          shipping_addresses_country_id: null,
          shipping_addresses_city_id: null,
          shipping_addresses_phone: null,
          shipping_addresses_ward_id: null,
          shipping_addresses_full_address: null,

          card_number: "",
          full_name: "",
          district_id: null,
          phone: "",
          ward_id: null,
          shipping_addresses_card_number: null,
          full_address: null,
          gender: null,
          birthday: null,
          customer_group_id: null,
        };
  }, [
    customer,
    shippingAddress?.city_id,
    shippingAddress?.country_id,
    shippingAddress?.district_id,
    shippingAddress?.full_address,
    shippingAddress?.name,
    shippingAddress?.phone,
    shippingAddress?.ward_id,
    shippingAddressesSecondPhone,
  ]);

  console.log("shippingAddress 111", shippingAddress, initialFormValueShippingAddress);

  const newAreas = useMemo(() => {
    return areas.map((area: any) => {
      return {
        ...area,
        city_name_normalize: area.city_name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("tinh ", "")
          .replace("tp. ", ""),
        district_name_normalize: area.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("quan ", "")
          .replace("huyen ", "")
          .replace("thi xa ", ""),
      };
    });
  }, [areas]);

  const getWards = useCallback(
    (value: number | undefined) => {
      if (value) {
        dispatch(
          WardGetByDistrictAction(value, (data) => {
            const value = formRefCustomer.current?.getFieldValue("full_address");
            if (value) {
              const newValue = value.toLowerCase();

              const newWards = data.map((ward: any) => {
                return {
                  ...ward,
                  ward_name_normalize: ward.name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "D")
                    .toLowerCase()
                    .replace("phuong ", "")
                    .replace("xa ", ""),
                };
              });
              const findWard = newWards.find(
                (ward: any) => newValue.indexOf(ward.ward_name_normalize) > -1,
              );
              formRefCustomer.current?.setFieldsValue({
                ward_id: findWard ? findWard.id : null,
              });
            }
            setWards(data);
          }),
        );
      }
    },
    [dispatch, formRefCustomer],
  );

  const getShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(
          WardGetByDistrictAction(value, (data) => {
            const value = formRefCustomer.current?.getFieldValue("shipping_addresses_full_address");
            if (value) {
              const newValue = value.toLowerCase();
              const newWards = data.map((ward: any) => {
                return {
                  ...ward,
                  ward_name_normalize: ward.name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "D")
                    .toLowerCase()
                    .replace("phuong ", "")
                    .replace("xa ", ""),
                };
              });
              let district = document.getElementsByClassName("inputDistrictUpdateCustomer")[0]
                .textContent;
              const foundWard = findWard(district, newWards, newValue);
              formRefCustomer.current?.setFieldsValue({
                shipping_addresses_ward_id: foundWard ? foundWard.id : null,
              });
            }
            setShippingWards(data);
          }),
        );
      }
    },
    [dispatch, formRefCustomer],
  );

  const checkAddress = useCallback(
    (type, value) => {
      const findArea = handleFindArea(value, newAreas);
      if (findArea) {
        switch (type) {
          case "full_address":
            if (formRefCustomer.current?.getFieldValue("district_id") !== findArea.id) {
              formRefCustomer.current?.setFieldsValue({
                district_id: findArea.id,
                ward_id: null,
              });
              getWards(findArea.id);
            }
            break;
          case "shipping_addresses_full_address":
            if (
              formRefCustomer.current?.getFieldValue("shipping_addresses_district_id") !==
              findArea.id
            ) {
              formRefCustomer.current?.setFieldsValue({
                shipping_addresses_district_id: findArea.id,
                shipping_addresses_ward_id: null,
              });
              getShippingWards(findArea.id);
            }
            break;
          default:
            break;
        }
      }
    },
    [formRefCustomer, getShippingWards, getWards, newAreas],
  );

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

  const handleSubmit = useCallback(
    (value: any) => {
      console.log(customer);
      if (!customer) return;
      let _shippingAddress: ShippingAddress[] = customer.shipping_addresses
        ? customer.shipping_addresses
        : [];

      if (shippingAddress && _shippingAddress && _shippingAddress.length > 0) {
        let index = _shippingAddress.findIndex((x) => x.id === shippingAddress.id);
        _shippingAddress.splice(index, 1);
      }

      let shippingDistrict = areas.find(
        (area: any) => area.id === value.shipping_addresses_district_id,
      );
      let shippingWard = shippingWards.find(
        (ward: any) => ward.id === value.shipping_addresses_ward_id,
      );
      let customerDistrict = areas.find((area: any) => area.id === value.district_id);
      let customerWard = wards.find((ward: any) => ward.id === value.ward_id);

      let paramShipping: any = {
        ...shippingAddress,
        name: value.shipping_addresses_name.trim(),
        district_id: value.shipping_addresses_district_id,
        district: shippingDistrict.name,
        city_id: shippingDistrict.city_id,
        city: shippingDistrict.city_name,
        phone: value.shipping_addresses_phone.trim(),
        ward_id: value.shipping_addresses_ward_id,
        ward: shippingWard?.name,
        full_address: value.shipping_addresses_full_address,
        is_default: true,
        default: true,
        country_id: shippingAddress ? shippingAddress.country_id : VietNamId,
      };

      _shippingAddress.push(paramShipping);
      let customerRequest: CustomerRequest | any = { ...new CustomerModel() };

      if (isVisibleCollapseCustomer === true) {
        customerRequest = {
          ...new CustomerModel(),
          ...customer,
          billing_addresses: customer.billing_addresses.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          shipping_addresses: _shippingAddress.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          country_id: customer.country_id || VietNamId,
          full_name: value.full_name,
          city_id: customerDistrict.city_id,
          city: customerDistrict.city_name,
          district_id: value.district_id,
          district: customerDistrict.name,
          phone: value.phone,
          ward_id: value.ward_id,
          ward: customerWard?.name,
          card_number: value.card_number,
          full_address: value.full_address,
          gender:
            GENDER_OPTIONS.findIndex((p) => p.value === value.gender) === -1 ? null : value.gender,
          birthday: value.birthday,
          customer_group_id: value.customer_group_id,
        };
      } else {
        customerRequest = {
          ...customer,
          gender:
            GENDER_OPTIONS.findIndex((p) => p.value === customer.gender) === -1
              ? null
              : customer.gender,
          billing_addresses: customer.billing_addresses
            ? customer.billing_addresses.map((item: any) => {
                let _item = { ...item };
                _item.is_default = _item.default;
                return _item;
              })
            : [],
          shipping_addresses: _shippingAddress
            ? _shippingAddress.map((item: any) => {
                let _item = { ...item };
                _item.is_default = _item.default;
                return _item;
              })
            : [],
        };
      }
      dispatch(
        CustomerUpdateAction(customer.id, customerRequest, (data: CustomerResponse) => {
          if (data) {
            showSuccess("Cập nhật thông tin khách thành công!");
            setCustomerChange(false);
            handleChangeCustomer(data);
            const shippingAddress = getCustomerShippingAddress(data);
            const orderAmount = totalAmount(orderLineItems);
            handleCalculateShippingFeeApplyOrderSetting(
              shippingAddress?.city_id,
              orderAmount,
              shippingServiceConfig,
              transportService,
              form,
              setShippingFeeInformedToCustomer,
              isOrderUpdate,
            );
          } else {
            dispatch(
              getCustomerDetailAction(customer.id, (data_i: CustomerResponse | null) => {
                if (data_i) {
                  handleChangeCustomer(data_i);
                }
              }),
            );
          }
        }),
      );
    },
    [
      areas,
      customer,
      dispatch,
      form,
      handleChangeCustomer,
      isOrderUpdate,
      isVisibleCollapseCustomer,
      orderLineItems,
      setCustomerChange,
      setShippingFeeInformedToCustomer,
      shippingAddress,
      shippingServiceConfig,
      shippingWards,
      transportService,
      wards,
    ],
  );

  const handleShippingAddressDelete = () => {
    if (singleShippingAddress) {
      if (customer)
        dispatch(
          DeleteShippingAddress(singleShippingAddress.id, customer.id, (data: ShippingAddress) => {
            dispatch(
              getCustomerDetailAction(customer.id, (data_i: CustomerResponse) => {
                handleChangeCustomer(data_i);
              }),
            );
            data ? showSuccess("Xóa địa chỉ thành công") : showError("Xóa địa chỉ thất bại");
          }),
        );
    }
  };

  const handleOkOrderBillRequest = (
    values: OrderBillRequestFormModel,
    orderBillId: number | null,
  ) => {
    setIsVisibleOrderBillRequestModal(false);
    setBillingAddress({
      ...billingAddress,
      order_id: orderBillId,
      ...values,
    });
    setOrderBillId(orderBillId);
  };

  const onCancelShippingDelete = () => {
    setIsVisibleShippingModal(false);
  };

  const onOkShippingDelete = () => {
    handleShippingAddressDelete();
    setIsVisibleShippingModal(false);
  };

  const handleClickDeleteExportRequest = () => {
    setIsVisibleOrderBillRequestModal(false);
    setIsVisibleConfirmDeleteOrderBillRequestModal(true);
  };

  const handleDeleteExportRequest = () => {
    setBillingAddress(null);
    setIsVisibleConfirmDeleteOrderBillRequestModal(false);
    setOrderBillId(null);
  };

  const onOkPress = useCallback(() => {
    customerForm.submit();
  }, [customerForm]);

  useEffect(() => {
    if (shippingAddress && shippingAddress.district_id) {
      dispatch(WardGetByDistrictAction(shippingAddress.district_id, setShippingWards));
    }
  }, [dispatch, shippingAddress]);

  useEffect(() => {
    if (customer.district_id) {
      dispatch(WardGetByDistrictAction(customer.district_id, setWards));
    }
  }, [dispatch, customer.district_id]);

  useEffect(() => {
    customerForm.resetFields();
  }, [customerForm, shippingAddress, customer]);

  return (
    <StyleComponent>
      <Row style={{ margin: "10px 0px" }}>
        <Col span={12}>ĐỊA CHỈ GIAO HÀNG</Col>
        <Col span={12}>
          <OrderBillRequestButton
            handleClickOrderBillRequestButton={() => setIsVisibleOrderBillRequestModal(true)}
            orderDetail={orderDetail}
            color={textBodyColor}
          />
        </Col>
      </Row>

      <Form
        layout="vertical"
        form={customerForm}
        ref={formRefCustomer}
        onFinish={handleSubmit}
        initialValues={initialFormValueShippingAddress}
        name="customer_update"
        onValuesChange={() => setCustomerChange(true)}
      >
        <Form.Item label="city" name="shipping_addresses_city_id" hidden>
          <Input />
        </Form.Item>

        <Spin tip="Vui lòng chờ..." spinning={false} delay={100}>
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên khách hàng",
                  },
                  {
                    whitespace: true,
                    message: "Vui lòng nhập tên khách hàng",
                  },
                ]}
                name="shipping_addresses_name"
                //label="Tên khách hàng"
              >
                <Input
                  placeholder="Nhập Tên khách hàng"
                  prefix={<UserOutlined className="icon-color" />}
                  //suffix={<img src={arrowDownIcon} alt="down" />}
                  disabled={disableInput}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="shipping_addresses_district_id"
                //label="Khu vực"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn khu vực",
                  },
                ]}
                className="inputDistrictUpdateCustomer"
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  placeholder={
                    <React.Fragment>
                      <EnvironmentOutlined className="icon-color" />
                      <span> Chọn khu vực</span>
                    </React.Fragment>
                  }
                  style={{ width: "100%" }}
                  onChange={(value: number) => {
                    let values = formRefCustomer.current?.getFieldsValue();
                    values.shipping_addresses_ward_id = null;
                    formRefCustomer.current?.setFieldsValue(values);
                    getShippingWards(value);
                  }}
                  optionFilterProp="children"
                  disabled={disableInput}
                >
                  {newAreas.map((area: any) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.city_name + ` - ${area.name}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                rules={[
                  () => ({
                    validator(_, value) {
                      if (value.length === 0) {
                        return Promise.reject(new Error("Vui lòng nhập Số điện thoại!"));
                      }
                      if (!RegUtil.PHONE.test(value.trim())) {
                        return Promise.reject(new Error("Số điện thoại sai định dạng!"));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                name="shipping_addresses_phone"
                required={false}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined className="icon-color" />}
                  disabled={disableInput}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="shipping_addresses_ward_id"
                //label="Phường xã"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phường/xã",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                  placeholder={
                    <React.Fragment>
                      <EnvironmentOutlined className="icon-color" />
                      <span> Chọn phường/xã</span>
                    </React.Fragment>
                  }
                  disabled={disableInput}
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
              <Form.Item style={customer !== null ? { marginBottom: "0px" } : {}}>
                <Input
                  placeholder="Nhập số điện thoại phụ"
                  prefix={<PhoneOutlined className="icon-color" />}
                  disabled={disableInput}
                  value={shippingAddressesSecondPhone}
                  onChange={(value) => {
                    if (setShippingAddressesSecondPhone)
                      setShippingAddressesSecondPhone(value.target.value);
                    //ShippingAddressChange({...shippingAddress,second_phone:value.target.value})
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="shipping_addresses_full_address"
                style={customer !== null ? { marginBottom: "0px" } : {}}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chi tiết địa chỉ giao hàng",
                  },
                ]}
              >
                <Input
                  placeholder="Địa chỉ"
                  prefix={<EnvironmentOutlined className="icon-color" />}
                  disabled={disableInput}
                  onChange={(e) =>
                    handleDelayActionWhenInsertTextInSearchInput(
                      fullAddressRef,
                      () => {
                        checkAddress("shipping_addresses_full_address", e.target.value);
                      },
                      500,
                    )
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          {disableInput !== true && (
            <React.Fragment>
              <DividerCustom
                type={"extend"}
                setVisibleCollapse={setVisibleCollapseCustomer}
                isVisibleCollapse={isVisibleCollapseCustomer}
                content={
                  <Popover
                    placement="left"
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
                        <Button type="link" icon={<PlusOutlined />} onClick={ShowAddressModalAdd}>
                          Thêm địa chỉ mới
                        </Button>
                      </Row>
                    }
                    content={
                      <CustomerShippingAddressOrder
                        customer={customer}
                        handleChangeCustomer={handleChangeCustomer}
                        handleShippingEdit={ShowAddressModalEdit}
                        handleShippingDelete={showAddressModalDelete}
                        handleSingleShippingAddress={setSingleShippingAddress}
                      />
                    }
                    trigger="click"
                    className="change-shipping-address"
                  >
                    <Button
                      type="link"
                      icon={<PlusOutlined />}
                      className="btn-style"
                      style={{ paddingRight: 0 }}
                    >
                      Thay đổi địa chỉ giao hàng
                    </Button>
                  </Popover>
                }
              />

              {isVisibleCollapseCustomer === true && (
                <div>
                  <Row>
                    <div className="page-filter-left">THÔNG TIN KHÁCH HÀNG</div>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên khách hàng",
                          },
                        ]}
                        name="full_name"
                        //label="Tên khách hàng"
                      >
                        <Input
                          placeholder="Nhập Tên khách hàng"
                          prefix={<UserOutlined className="icon-color" />}
                          //suffix={<img src={arrowDownIcon} alt="down" />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="district_id"
                        //label="Khu vực"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn khu vực",
                          },
                        ]}
                      >
                        <Select
                          className="select-with-search"
                          showSearch
                          allowClear
                          placeholder={
                            <React.Fragment>
                              <EnvironmentOutlined className="icon-color" />
                              <span> Chọn khu vực</span>
                            </React.Fragment>
                          }
                          style={{ width: "100%" }}
                          onChange={(value) => {
                            let values = formRefCustomer.current?.getFieldsValue();
                            values.ward_id = null;
                            formRefCustomer.current?.setFieldsValue(values);
                            getWards(Number(value));
                          }}
                          optionFilterProp="children"
                        >
                          {newAreas.map((area: any) => (
                            <Select.Option key={area.id} value={area.id}>
                              {area.city_name + ` - ${area.name}`}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Form.Item label="city" name="city_id" hidden></Form.Item>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        rules={[
                          () => ({
                            validator(_, value) {
                              if (value.trim().length === 0) {
                                return Promise.reject(new Error("Vui lòng nhập Số điện thoại!"));
                              }
                              if (!RegUtil.PHONE.test(value.trim())) {
                                return Promise.reject(new Error("Số điện thoại sai định dạng!"));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                        name="phone"
                      >
                        <Input
                          placeholder="Nhập số điện thoại"
                          prefix={<PhoneOutlined className="icon-color" />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="ward_id"
                        //label="Phường xã"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn phường/xã",
                          },
                        ]}
                      >
                        <Select
                          className="select-with-search"
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          style={{ width: "100%" }}
                          placeholder={
                            <React.Fragment>
                              <EnvironmentOutlined className="icon-color" />
                              <span> Chọn phường/xã</span>
                            </React.Fragment>
                          }
                        >
                          {wards.map((ward: any) => (
                            <Select.Option key={ward.id} value={ward.id}>
                              {ward.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="card_number"
                        //style={customerItem !== null ? { marginBottom: "0px" } : {}}
                      >
                        <Input
                          placeholder="Nhập mã thẻ"
                          prefix={<BarcodeOutlined className="icon-color" />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="full_address"
                        //style={customerItem !== null ? { marginBottom: "0px" } : {}}
                      >
                        <Input
                          placeholder="Địa chỉ"
                          prefix={<EnvironmentOutlined className="icon-color" />}
                          onChange={(e) =>
                            handleDelayActionWhenInsertTextInSearchInput(
                              fullAddressRef,
                              () => {
                                checkAddress("full_address", e.target.value);
                              },
                              500,
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="gender"
                        //label="Giới tính"
                      >
                        <Select
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          placeholder={
                            <React.Fragment>
                              <ManOutlined className="icon-color" />
                              <span> Giới tính</span>
                            </React.Fragment>
                          }
                          className="select-with-search"
                        >
                          <Select.Option key={1} value={"male"}>
                            Nam
                          </Select.Option>
                          <Select.Option key={2} value={"female"}>
                            Nữ
                          </Select.Option>
                          <Select.Option key={3} value={"other"}>
                            Không xác định
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="birthday"
                        // label="Ngày sinh"
                        rules={[
                          {
                            validator: async (_, birthday) => {
                              if (birthday && birthday > new Date()) {
                                return Promise.reject(
                                  new Error("Ngày sinh không được lớn hơn ngày hiện tại"),
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          defaultPickerValue={
                            customer?.birthday ? moment(customer?.birthday) : undefined
                          }
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày sinh"
                          format={"DD/MM/YYYY"}
                          suffixIcon={
                            <CalendarOutlined style={{ color: "#71767B", float: "left" }} />
                          }
                          onMouseLeave={() => {
                            const elm = document.getElementById("customer_update_birthday");
                            const newDate = elm?.getAttribute("value")
                              ? moment(elm?.getAttribute("value"), "DD/MM/YYYY")
                              : undefined;
                            if (newDate) {
                              formRefCustomer.current?.setFieldsValue({
                                birthday: newDate,
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        name="customer_group_id"
                        // label="Nhóm"
                      >
                        <Select
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          placeholder={
                            <React.Fragment>
                              <TeamOutlined className="icon-color" />
                              <span> Nhóm khách hàng</span>
                            </React.Fragment>
                          }
                          className="select-with-search"
                        >
                          {groups &&
                            groups.map((group: any) => (
                              <Select.Option key={group.id} value={group.id}>
                                {group.name}
                              </Select.Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}
              <DividerCustom
                type={"collapse"}
                setVisibleCollapse={setVisibleCollapseCustomer}
                isVisibleCollapse={isVisibleCollapseCustomer}
              />

              {customerChange && (
                <Row className="customer-footer">
                  <Button
                    type="primary"
                    className="create-button-custom ant-btn-outline fixed-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOkPress();
                    }}
                  >
                    Cập nhật
                  </Button>
                </Row>
              )}
            </React.Fragment>
          )}
        </Spin>
      </Form>

      <AddAddressModal
        customer={customer}
        areas={areas}
        handleChangeCustomer={handleChangeCustomer}
        formItem={singleShippingAddress}
        visible={isVisibleAddress}
        modalAction={modalActionShipping}
        onCancel={() => setVisibleAddress(false)}
        onOk={() => setVisibleAddress(false)}
        setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
        isOrderUpdate={isOrderUpdate}
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

      <OrderBillRequestModal
        modalTitle={
          orderDetail?.bill?.id ? "Chỉnh sửa thông tin xuất hóa đơn" : "Thông tin xuất hóa đơn"
        }
        isVisibleOrderBillRequestModal={isVisibleOrderBillRequestModal}
        handleCancel={() => {
          setIsVisibleOrderBillRequestModal(false);
        }}
        isPageOrderUpdate={isPageOrderUpdate}
        handleClickDelete={isPageOrderUpdate ? handleClickDeleteExportRequest : undefined}
        orderDetail={orderDetail}
        handleOk={handleOkOrderBillRequest}
        billingAddress={billingAddress}
        orderBillId={orderBillId}
        setOrderBillId={setOrderBillId}
        customer={customer}
      />
      {isPageOrderUpdate && (
        <DeleteOrderBillRequestConfirmModal
          isVisibleDeleteOrderBillRequestConfirmModal={isVisibleConfirmDeleteOrderBillRequestModal}
          handleCancel={() => {
            setIsVisibleConfirmDeleteOrderBillRequestModal(false);
          }}
          handleDeleteExportRequest={handleDeleteExportRequest}
        />
      )}
    </StyleComponent>
  );
};

export default UpdateCustomer;
