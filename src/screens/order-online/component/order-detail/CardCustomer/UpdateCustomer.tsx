import {
  BarcodeOutlined,
  CalendarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  PlusOutlined,
  TeamOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  Popover,
  Row,
  Select,
  Spin
} from "antd";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import {
  CustomerUpdateAction, getCustomerDetailAction,
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CustomerModel, CustomerRequest, CustomerShippingAddress } from "model/request/customer.request";
import {
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertStringDistrict, findWard, getCustomerShippingAddress, handleCalculateShippingFeeApplyOrderSetting, totalAmount } from "utils/AppUtils";
import { GENDER_OPTIONS, VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import CustomerShippingAddressOrder from "./customer-shipping";

type UpdateCustomerProps = {
  areas: any;
  groups: any;
  handleChangeCustomer: any;
  customerItem: any;
  shippingAddress: ShippingAddress | any;
  levelOrder?: number;
  shippingAddressesSecondPhone?:string;
  setShippingAddressesSecondPhone?:(value:string)=>void;
  setSingleShippingAddress: (item: CustomerShippingAddress | null) => void;
  ShippingAddressChange: (items: any) => void;
  ShowAddressModalEdit: () => void;
  showAddressModalDelete: () => void;
  ShowAddressModalAdd: () => void;
  setShippingFeeInformedToCustomer: ((value: number | null) => void) | undefined;
  form: FormInstance<any>;
};

const UpdateCustomer: React.FC<UpdateCustomerProps> = (props) => {
  const {
    areas,
    groups,
    handleChangeCustomer,
    customerItem,
    shippingAddress,
    levelOrder = 0,
    shippingAddressesSecondPhone,
    setSingleShippingAddress,
    ShippingAddressChange,
    ShowAddressModalEdit,
    showAddressModalDelete,
    ShowAddressModalAdd,
    setShippingAddressesSecondPhone,
    setShippingFeeInformedToCustomer,
    form,
  } = props;

  const orderLineItems = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.orderLineItems);

  const shippingServiceConfig = useSelector((state: RootReducerType) => state.orderReducer.shippingServiceConfig);

  const transportService = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service);

  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRefCustomer = createRef<FormInstance>();

  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);

  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(false);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>([]);

  const newAreas = useMemo(() => {
    return areas.map((area: any) => {
      return {
        ...area,
        city_name_normalize: area.city_name.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("tinh ", "")
          .replace("tp. ", ""),
        district_name_normalize: area.name.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("quan ", "")
          .replace("huyen ", "")
          // .replace("thanh pho ", "")
          .replace("thi xa ", ""),
      }
    })
  }, [areas]);

  const getWards = useCallback(
    (value: number | undefined) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, (data) => {
          const value = formRefCustomer.current?.getFieldValue("full_address");
          if (value) {
            const newValue = value.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")
              .toLowerCase();
              
            const newWards = data.map((ward: any) => {
              return {
                ...ward,
                ward_name_normalize: ward.name.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .toLowerCase()
                .replace("phuong ", "")
                .replace("xa ", ""),
              }
            });
            const findWard = newWards.find((ward: any) => newValue.indexOf(ward.ward_name_normalize) > -1);
            formRefCustomer.current?.setFieldsValue({
              ward_id: findWard ? findWard.id : null,
            })
            
          }
          setWards(data);
        }));
      }
    },
    [dispatch, formRefCustomer]
  );

  const getShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, (data) => {
          const value = formRefCustomer.current?.getFieldValue("shipping_addresses_full_address");
          if (value) {
            const newValue = value.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")
              .toLowerCase();
            const newWards = data.map((ward: any) => {
              return {
                ...ward,
                ward_name_normalize: ward.name.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .toLowerCase()
                .replace("phuong ", "")
                .replace("xa ", ""),
              }
            });
            let district = document.getElementsByClassName("inputDistrictUpdateCustomer")[0].textContent;
            console.log('district', district)
            const foundWard = findWard(district, newWards, newValue);
            console.log('foundWard', foundWard)
            formRefCustomer.current?.setFieldsValue({
              shipping_addresses_ward_id: foundWard ? foundWard.id : null,
            })
          }
          setShippingWards(data);
        }));

      }
    },
    [dispatch, formRefCustomer]
  );

  //properties
  const disableInput = levelOrder >= 4 ? true : false;

  useEffect(() => {
    //element
    const txtShippingAddressName = document.getElementById("customer_update_shipping_addresses_name");
    const txtShippingAddressPhone = document.getElementById("customer_update_shipping_addresses_phone");
    const txtShippingAddressCardNumber = document.getElementById("customer_update_shipping_addresses_card_number");
    const txtShippingAddressFullAddress = document.getElementById("customer_update_shipping_addresses_full_address");

    //event
    txtShippingAddressName?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtShippingAddressPhone?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtShippingAddressCardNumber?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtShippingAddressFullAddress?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });
  })

  useEffect(() => {
    const txtCustomerFullName = document.getElementById("customer_update_full_name");
    const txtCustomerPhone = document.getElementById("customer_update_phone");
    const txtCustomerCarNumber = document.getElementById("customer_update_card_number");
    const txtCustomerFullAddress = document.getElementById("customer_update_full_address");

    txtCustomerFullName?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtCustomerPhone?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtCustomerCarNumber?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });

    txtCustomerFullAddress?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });
  }, [isVisibleCollapseCustomer])

  const initialFormValueshippingAddress =
    customerItem
      ? {
        full_name: customerItem.full_name,
        district_id: customerItem.district_id,
        phone: customerItem.phone || "",
        ward_id: customerItem.ward_id,
        card_number: customerItem.card_number,
        full_address: customerItem.full_address,
        gender: customerItem.gender,
        birthday: customerItem.birthday ? moment(customerItem.birthday) : null,
        customer_group_id: customerItem.customer_group_id,

        shipping_addresses_card_number: customerItem.card_number,
        shipping_addresses_name: shippingAddress?.name,
        shipping_addresses_district_id: shippingAddress?.district_id,
        shipping_addresses_country_id: shippingAddress?.country_id,
        shipping_addresses_city_id: shippingAddress?.city_id,
        shipping_addresses_phone: shippingAddress?.phone || "",
        shipping_addresses_ward_id: shippingAddress?.ward_id,
        shipping_addresses_full_address: shippingAddress?.full_address,
        shipping_addresses_second_phone: shippingAddressesSecondPhone
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

  useEffect(() => {
    if (shippingAddress && shippingAddress.district_id) {
      dispatch(WardGetByDistrictAction(shippingAddress.district_id, setShippingWards));
    }
  }, [dispatch, shippingAddress]);

  useEffect(() => {
    if (customerItem.district_id) {
      dispatch(WardGetByDistrictAction(customerItem.district_id, setWards));
    }
  }, [dispatch, customerItem.district_id]);

  const handleSubmit = useCallback(
    (value: any) => {
      //return;
      if (!customerItem) return;

      let _shippingAddress: ShippingAddress[] = customerItem.shipping_addresses ? customerItem.shipping_addresses : [];

      if (shippingAddress && _shippingAddress && _shippingAddress.length > 0) {
        let index = _shippingAddress.findIndex((x) => x.id === shippingAddress.id);
        _shippingAddress.splice(index, 1);
      }

      let shipping_district = newAreas.find((area: any) => area.id === value.shipping_addresses_district_id);
      let shipping_ward=shippingWards.find((ward:any)=>ward.id===value.shipping_addresses_ward_id)
      let customer_district = newAreas.find((area: any) => area.id === value.district_id);
      let customer_ward= wards.find((ward:any)=>ward.id===value.ward_id);

      let paramShipping = {
        ...shippingAddress,
        name: value.shipping_addresses_name.trim(),
        district_id: value.shipping_addresses_district_id,
        district:shipping_district.name,
        city_id: shipping_district.city_id,
        city: shipping_district.city_name,
        phone: value.shipping_addresses_phone.trim(),
        ward_id: value.shipping_addresses_ward_id,
        ward:shipping_ward?.name,
        full_address: value.shipping_addresses_full_address,
        is_default: true,
        default: true,
        country_id: shippingAddress ? shippingAddress.country_id : VietNamId
      };

      _shippingAddress.push(paramShipping);

      let customerRequest: CustomerRequest = { ...new CustomerModel() };

      if (isVisibleCollapseCustomer === true) {
        customerRequest = {
          ...customerItem,
          billing_addresses: customerItem.billing_addresses.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          shipping_addresses: _shippingAddress.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          country_id: customerItem.country_id || VietNamId,
          full_name: value.full_name,
          city_id: customer_district.city_id,
          city: customer_district.city_name,
          district_id: value.district_id,
          district:customer_district.name,
          phone: value.phone,
          ward_id: value.ward_id,
          ward: customer_ward?.name,
          card_number: value.card_number,
          full_address: value.full_address,
          gender: GENDER_OPTIONS.findIndex((p)=>p.value===value.gender)===-1?null:value.gender,
          birthday: value.birthday,
          customer_group_id: value.customer_group_id
        }
      }
      else {
        customerRequest = {
          ...customerItem,
          gender: GENDER_OPTIONS.findIndex((p)=>p.value===customerItem.gender)===-1?null:customerItem.gender,
          billing_addresses: customerItem.billing_addresses ? customerItem.billing_addresses.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }) : [],
          shipping_addresses: _shippingAddress ? _shippingAddress.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }) : []
        }
      }
      dispatch(CustomerUpdateAction(customerItem.id, customerRequest, (datas: CustomerResponse) => {
        if (datas) {
          showSuccess("Cập nhật thông tin khách thành công!");
          setVisibleBtnUpdate(false);
          handleChangeCustomer(datas);
          const shippingAddress = getCustomerShippingAddress(datas);
          const orderAmount = totalAmount(orderLineItems);
          handleCalculateShippingFeeApplyOrderSetting(shippingAddress?.city_id, orderAmount, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer)
        }
        else{
          dispatch(
            getCustomerDetailAction(
              customerItem.id,
              (data_i: CustomerResponse | null) => {
                if (data_i) {
                  handleChangeCustomer(data_i);
                }
              }
            )
          );
        }

      }));
    },
    [customerItem, shippingAddress, newAreas, shippingWards, wards, isVisibleCollapseCustomer, dispatch, handleChangeCustomer, orderLineItems, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer]
  );

  const onOkPress = useCallback(() => {
    customerForm.submit();
  }, [customerForm]);

  const checkAddress = useCallback((type, value) => {
    // trường hợp hà tĩnh thì phải replace trước khi convert
    // bắc quang hà giang: quận trước
    const newValue = value.toLowerCase().replace("tỉnh", "").replace("quận", "").replace("huyện", "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace("thanh pho", "")
      .replace("thi xa", "")
      .replaceAll("-", " ")
    // khi tìm xong tỉnh thì xóa ký tự đó để tìm huyện
    const findArea = newAreas.find((area: any) => {
      const districtString = convertStringDistrict(area.name);
      // tp thì xóa dấu cách thừa, tỉnh thì ko-chưa biết sao: 
      // test Thị xã Phú Mỹ, bà rịa vũng tàu
      // test khu một thị trấn lam Sơn huyện thọ Xuân tỉnh thanh hoá
      const cityString = convertStringDistrict(area.city_name).replace(/\s\s+/g, ' ');
      return newValue.indexOf(cityString) > -1 && (newValue.indexOf(districtString) > -1 && newValue.replace(cityString, "").indexOf(districtString) > -1)
    });
    if (findArea) {
      switch (type) {
        case "full_address":
          if (formRefCustomer.current?.getFieldValue("district_id") !== findArea.id) {
            formRefCustomer.current?.setFieldsValue({
              district_id: findArea.id,
              ward_id: null
            })
            getWards(findArea.id);
          }
          break;
        case "shipping_addresses_full_address":
          if (formRefCustomer.current?.getFieldValue("shipping_addresses_district_id") !== findArea.id) {
            formRefCustomer.current?.setFieldsValue({
              shipping_addresses_district_id: findArea.id,
              shipping_addresses_ward_id: null
            })
            getShippingWards(findArea.id);
          }
          break;
        default: break;
      }
      
    }
  }, [formRefCustomer, getShippingWards, getWards, newAreas]);


  useEffect(() => {
    customerForm.resetFields();
  }, [customerForm,shippingAddress]);

  return (
    <>
      <Row style={{ margin: "10px 0px" }}>
        <div className="page-filter-left">ĐỊA CHỈ GIAO HÀNG</div>
      </Row>
      <Form
        layout="vertical"
        form={customerForm}
        ref={formRefCustomer}
        onFinish={handleSubmit}
        initialValues={initialFormValueshippingAddress}
        name="customer_update"
      >
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
                  prefix={<UserOutlined style={{ color: "#71767B" }} />}
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
                      <EnvironmentOutlined style={{ color: "#71767B" }} />
                      <span> Chọn khu vực</span>
                    </React.Fragment>
                  }
                  style={{ width: "100%" }}
                  onChange={(value: number) => {
                    let values = formRefCustomer.current?.getFieldsValue();
                    values.shipping_addresses_ward_id = null;
                    formRefCustomer.current?.setFieldsValue(values);
                    getShippingWards(value);
                    setVisibleBtnUpdate(true);
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

            <Form.Item label="city" name="shipping_addresses_city_id" hidden>
              <Input />
            </Form.Item>

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
                  prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
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
                      <EnvironmentOutlined style={{ color: "#71767B" }} />
                      <span> Chọn phường/xã</span>
                    </React.Fragment>
                  }
                  onChange={() => {
                    setVisibleBtnUpdate(true);
                  }}
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
              <Form.Item
                name="shipping_addresses_second_phone"
                style={customerItem !== null ? { marginBottom: "0px" } : {}}
              >
                <Input
                  placeholder="Nhập số điện thoại phụ"
                  prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
                  disabled={disableInput}
                  value={shippingAddressesSecondPhone}
                  onChange={(value)=>{
                    if(setShippingAddressesSecondPhone)
                      setShippingAddressesSecondPhone(value.target.value);
                    //ShippingAddressChange({...shippingAddress,second_phone:value.target.value})
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="shipping_addresses_full_address"
                style={customerItem !== null ? { marginBottom: "0px" } : {}}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chi tiết địa chỉ giao hàng",
                  },
                ]}
              >
                <Input
                  placeholder="Địa chỉ"
                  prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                  disabled={disableInput}
                  onChange={(e) => checkAddress("shipping_addresses_full_address", e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          {disableInput !== true && (
            <div>
              <div>
                {isVisibleCollapseCustomer === false && (
                  <Row style={{ margin: "0 0", color: "#5656A1" }}>
                    <div className="page-filter-left" style={{ width: "15%" }}>
                      <Button
                        type="link"
                        icon={<DownOutlined />}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          setVisibleCollapseCustomer(true);
                        }}
                      >
                        Xem thêm
                      </Button>
                    </div>
                    <div
                      className="page-filter-left"
                      style={{
                        width: "55%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div className="ant-divider ant-divider-horizontal"></div>
                    </div>
                    <div className="page-filter-right" style={{ width: "30%" }}>
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
                              Thay đổi địa chỉ mặc định
                            </div>
                            <Button
                              type="link"
                              icon={<PlusOutlined />}
                              onClick={ShowAddressModalAdd}
                            >
                              Thêm địa chỉ mới
                            </Button>
                          </Row>
                        }
                        content={
                          <CustomerShippingAddressOrder
                            customer={customerItem}
                            handleChangeCustomer={handleChangeCustomer}
                            handleShippingEdit={ShowAddressModalEdit}
                            handleShippingDelete={showAddressModalDelete}
                            handleSingleShippingAddress={setSingleShippingAddress}
                            handleShippingAddress={ShippingAddressChange}
                            form= {form}
                            setShippingFeeInformedToCustomer= {setShippingFeeInformedToCustomer}
                          />
                        }
                        trigger="click"
                        className="change-shipping-address"
                      >
                        <Button
                          type="link"
                          icon={<PlusOutlined />}
                          className="btn-style"
                          style={{ float: "right", padding: "0px" }}
                        >
                          Thay đổi địa chỉ giao hàng
                        </Button>
                      </Popover>
                    </div>
                  </Row>
                )}

                {isVisibleCollapseCustomer === true && (
                  <Divider orientation="right" style={{ color: "#5656A1", marginTop: 0 }}>
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
                          <Button
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={ShowAddressModalAdd}
                          >
                            Thêm địa chỉ mới
                          </Button>
                        </Row>
                      }
                      content={
                        <CustomerShippingAddressOrder
                          customer={customerItem}
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
                  </Divider>
                )}
              </div>
              {isVisibleCollapseCustomer === true && (
                <div>
                  <Row style={{ margin: "10px 0px" }}>
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
                          prefix={<UserOutlined style={{ color: "#71767B" }} />}
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
                              <EnvironmentOutlined style={{ color: "#71767B" }} />
                              <span> Chọn khu vực</span>
                            </React.Fragment>
                          }
                          style={{ width: "100%" }}
                          onChange={(value) => {
                            let values = formRefCustomer.current?.getFieldsValue();
                            values.ward_id = null;
                            formRefCustomer.current?.setFieldsValue(values);
                            getWards(Number(value));
                            setVisibleBtnUpdate(true);
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
                    <Form.Item label="city" name="city_id" hidden>
                    </Form.Item>

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
                          prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
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
                              <EnvironmentOutlined style={{ color: "#71767B" }} />
                              <span> Chọn phường/xã</span>
                            </React.Fragment>
                          }
                          onChange={() => {
                            setVisibleBtnUpdate(true);
                          }}
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
                          prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}
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
                          prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                          onChange={(e) => checkAddress("full_address", e.target.value)}
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
                              <ManOutlined style={{ color: "#71767B" }} />
                              <span> Giới tính</span>
                            </React.Fragment>
                          }
                          className="select-with-search"
                          onChange={() => {
                            setVisibleBtnUpdate(true);
                          }}
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
                                  new Error("Ngày sinh không được lớn hơn ngày hiện tại")
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          defaultPickerValue={customerItem?.birthday ? moment(customerItem?.birthday) : undefined} 
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày sinh"
                          format={"DD/MM/YYYY"}
                          suffixIcon={
                            <CalendarOutlined style={{ color: "#71767B", float: "left" }} />
                          }
                          onChange={() => {
                            setVisibleBtnUpdate(true);
                          }}
                          onMouseLeave={() => {
                            const elm = document.getElementById("customer_update_birthday");
                            const newDate = elm?.getAttribute('value') ? moment(elm?.getAttribute('value'), "DD/MM/YYYY") : undefined
                            if (newDate) {
                              formRefCustomer.current?.setFieldsValue({
                                birthday: newDate
                              })
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
                              <TeamOutlined style={{ color: "#71767B" }} />
                              <span> Nhóm khách hàng</span>
                            </React.Fragment>
                          }
                          className="select-with-search"
                          onChange={() => {
                            setVisibleBtnUpdate(true);
                          }}
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

              {isVisibleCollapseCustomer === true && (
                <Divider orientation="left" style={{ padding: 0, margin: 0, color: "#5656A1" }}>
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

              <Row style={{ marginTop: 15 }}>
                <Col md={24} style={{ float: "right", marginTop: "-10px" }}>
                  {isVisibleBtnUpdate === true && (
                    <Button
                      type="primary"
                      style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOkPress();
                      }}
                    >
                      Cập nhật
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Spin>

      </Form>
    </>
  );
};
export default UpdateCustomer;
