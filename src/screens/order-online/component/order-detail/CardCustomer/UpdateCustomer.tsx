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
  CustomerUpdateAction,
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import { CustomerModel, CustomerRequest, CustomerShippingAddress } from "model/request/customer.request";
import {
  CustomerResponse,
  ShippingAddress,
} from "model/response/customer/customer.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomerShippingAddressOrder from "screens/yd-page/yd-page-order-create/component/OrderCreateCustomer/customer-shipping";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";

type UpdateCustomerProps = {
  areas: any;
  wards: any;
  groups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  customerItem: any;
  shippingAddress: ShippingAddress | any;
  levelOrder?: number;
  setSingleShippingAddress: (item: CustomerShippingAddress | null) => void;
  ShippingAddressChange: (items: any) => void;
  ShowAddressModalEdit: () => void;
  showAddressModalDelete: () => void;
  ShowAddressModalAdd: () => void;
};

const UpdateCustomer: React.FC<UpdateCustomerProps> = (props) => {
  const {
    areas,
    wards,
    groups,
    handleChangeArea,
    handleChangeCustomer,
    customerItem,
    shippingAddress,
    levelOrder = 0,
    setSingleShippingAddress,
    ShippingAddressChange,
    ShowAddressModalEdit,
    showAddressModalDelete,
    ShowAddressModalAdd,
  } = props;

  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRefCustomer = createRef<FormInstance>();

  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);

  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(false);

  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>([]);

  const [customerFormLoading,setCustomerFormLoading]=useState(false);

  const handleShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, setShippingWards));
      }
    },
    [dispatch]
  );

  //properties
  const disableInput = levelOrder >= 4 ? true : false;

  //element
  const txtShippingAddressName = document.getElementById("customer_update_shipping_addresses_name");
  const txtShippingAddressPhone = document.getElementById("customer_update_shipping_addresses_phone");
  const txtShippingAddressCardNumber = document.getElementById("customer_update_shipping_addresses_card_number");
  const txtShippingAddressFullAddress = document.getElementById("customer_update_shipping_addresses_full_address");

  const txtCustomerFullName = document.getElementById("customer_update_full_name");
  const txtCustomerPhone = document.getElementById("customer_update_phone");
  const txtCustomerCarNumber = document.getElementById("customer_update_card_number");
  const txtCustomerFullAddress = document.getElementById("customer_update_full_address");

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

  const initialFormValueshippingAddress =
    shippingAddress && shippingAddress !== null && customerItem
      ? {
        full_name: customerItem.full_name,
        district_id: customerItem.district_id,
        phone: customerItem.phone,
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
        shipping_addresses_phone: shippingAddress?.phone,
        shipping_addresses_ward_id: shippingAddress?.ward_id,
        shipping_addresses_full_address: shippingAddress?.full_address,
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

  const handleSubmit = useCallback(
    (value: any) => {
      if (!shippingAddress && !customerItem) return;

      let _shippingAddress: ShippingAddress[] = customerItem.shipping_addresses;
      let index = _shippingAddress.findIndex((x) => x.id === shippingAddress.id);
      _shippingAddress.splice(index, 1);

      let area_shipping = areas.find((area: any) => area.id === value.shipping_addresses_district_id);
      let area_customer = areas.find((area: any) => area.id === value.district_id);

      let paramShipping = {
        ...shippingAddress,
        name: value.shipping_addresses_name.trim(),
        district_id: value.shipping_addresses_district_id,
        city_id: area_shipping.city_id,
        city: area_shipping.city_name,
        phone: value.shipping_addresses_phone.trim(),
        ward_id: value.shipping_addresses_ward_id,
        full_address: value.shipping_addresses_full_address,
        is_default: true,
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
          city_id: area_customer.city_id,
          city: area_customer.city_name,
          district_id: value.district_id,
          phone: value.phone,
          ward_id: value.ward_id,
          card_number: value.card_number,
          full_address: value.full_address,
          gender: value.gender,
          birthday: value.birthday,
          customer_group_id: value.customer_group_id,
        }
      }
      else {
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
          })
        }
      }
      setCustomerFormLoading(true);
      dispatch(CustomerUpdateAction(customerItem.id, customerRequest, (datas: CustomerResponse) => {
        if (datas) {
          handleChangeCustomer(datas);
          showSuccess("Cập nhật thông tin khách thành công");
        }
        setCustomerFormLoading(false);
      }));
    },
    [customerItem, dispatch, handleChangeCustomer, areas, shippingAddress, isVisibleCollapseCustomer]
  );

  const onOkPress = useCallback(() => {
    customerForm.submit();
    setVisibleBtnUpdate(false);
    
  }, [customerForm]);

  useEffect(() => {
    if (shippingAddress) customerForm.resetFields();
  }, [customerForm, shippingAddress]);

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
        <Spin tip="Vui lòng chờ..." spinning={customerFormLoading} delay={100}>
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
                    handleShippingWards(value);
                    setVisibleBtnUpdate(true);
                  }}
                  optionFilterProp="children"
                  disabled={disableInput}
                >
                  {areas.map((area: any) => (
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
                  {
                    required: true,
                    message: "Vui lòng nhập Số điện thoại",
                  },
                  {
                    required: true,
                    pattern: RegUtil.PHONE,
                    message: "Số điện thoại sai định dạng"
                  }
                ]}
                name="shipping_addresses_phone"
              //label="Số điện thoại"
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
                name="shipping_addresses_card_number"
                style={customerItem !== null ? { marginBottom: "0px" } : {}}
              >
                <Input
                  placeholder="Nhập mã thẻ"
                  prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}
                  disabled={disableInput}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item
                name="shipping_addresses_full_address"
                style={customerItem !== null ? { marginBottom: "0px" } : {}}
              >
                <Input
                  placeholder="Địa chỉ"
                  prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                  disabled={disableInput}
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
                      placement="topLeft"
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
                            handleChangeArea(value);
                            setVisibleBtnUpdate(true);
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
                    <Form.Item label="city" name="city_id" hidden>
                    </Form.Item>

                    <Col xs={24} lg={12}>
                      <Form.Item
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập Số điện thoại",
                          },
                          {
                            required: true,
                            pattern: RegUtil.PHONE,
                            message: "Số điện thoại sai định dạng"
                          }
                        ]}
                        name="phone"
                      //label="Số điện thoại"
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
                          style={{ width: "100%" }}
                          placeholder="Chọn ngày sinh"
                          format={"DD/MM/YYYY"}
                          suffixIcon={
                            <CalendarOutlined style={{ color: "#71767B", float: "left" }} />
                          }
                          onChange={() => {
                            setVisibleBtnUpdate(true);
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
