import {
  BarcodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Button, 
	Col, 
	Divider, 
	Form, 
	FormInstance, 
	Input, 
	Row,
  Select,
	Modal
} from "antd";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import {
    CreateShippingAddress,
    getCustomerDetailAction,
    UpdateShippingAddress
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import { CustomerShippingAddress } from "model/request/customer.request";
import {
  CustomerResponse,
  ShippingAddress
} from "model/response/customer/customer.response";
// import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomerShippingAddressOrder from "screens/yd-page/yd-page-order-create/component/OrderCreateCustomer/customer-shipping";
import { showError, showSuccess } from "utils/ToastUtils";
import {StyledComponent} from "./styles";

type UpdateCustomerProps = {
  areas: any;
  wards: any;
  groups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  customer: any;
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
    handleChangeCustomer,
    customer,
    shippingAddress,
    levelOrder = 0,
    setSingleShippingAddress,
    ShippingAddressChange,
    ShowAddressModalEdit,
    showAddressModalDelete,
    ShowAddressModalAdd,
  } = props;

  const dispatch = useDispatch();
  const [shippingAddressForm] = Form.useForm();
  // const [customerForm] = Form.useForm();
  const formRefAddress = createRef<FormInstance>();
  // const formRefCustomer = createRef<FormInstance>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);

  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(false);
  const [visibleModalChangeAddress, setVisibleModalChangeAddress] = useState(false)

  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>(
    []
  );

  //const [shippingDistrictId, setShippingDistrictId] = React.useState<any>(null);

  const handleShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, setShippingWards));
      }
    },
    [dispatch]
  );
  
  //properties
  const disableInput = levelOrder >= 4;

  //element
  const txtShippingAddressName = document.getElementById("shippingAddress_update_name");
  const txtShippingAddressPhone = document.getElementById("shippingAddress_update_phone");
  const txtShippingAddressCardNumber = document.getElementById("shippingAddress_update_card_number");
  const txtShippingAddressFullAddress = document.getElementById("shippingAddress_update_full_address");
  //event
  txtShippingAddressName?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true)
  });

  txtShippingAddressPhone?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true)
  });

  txtShippingAddressCardNumber?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true)
  });

  txtShippingAddressFullAddress?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true)
  });

  // const initialFormValueCustomer =
  //   customer !== null
  //     ? {
  //         full_name: customer.full_name,
  //         district_id: customer.district_id,
  //         phone: customer.phone,
  //         ward_id: customer.ward_id,
  //         card_number: customer.card_number,
  //         full_address: customer.full_address,
  //         gender: customer.gender,
  //         birthday: customer.birthday
  //           ? moment(customer.birthday)
  //           : null,
  //         customer_group_id: customer.customer_group_id,
  //       }
  //     : {
  //         full_name: "",
  //         district_id: null,
  //         phone: "",
  //         ward_id: null,
  //         card_number: null,
  //         full_address: null,
  //         gender: null,
  //         birthday: null,
  //         customer_group_id: null,
  //       };
      //let shippingAddressItem = customerItem.shipping_addresses.find((p:any) => p.default === true);

  const initialFormValueshippingAddress =
    shippingAddress
      ? {
          card_number: customer.card_number,
          name: shippingAddress?.name,
          district_id: shippingAddress?.district_id,
          country_id: shippingAddress?.country_id,
          city_id: shippingAddress?.city_id,
          phone: shippingAddress?.phone,
          ward_id: shippingAddress?.ward_id,
          full_address: shippingAddress?.full_address,
        }
      : {
          card_number: customer.card_number,
          name: customer.full_name,
          district_id: customer.district_id,
          country_id: customer.country_id,
          phone: customer.phone,
          ward_id: customer.ward_id,
          full_address: customer.full_address,
          gender: customer.gender,
          
        };


  useEffect(() => {
    if (shippingAddress && shippingAddress.district_id) {
      dispatch(
        WardGetByDistrictAction(shippingAddress.district_id, setShippingWards)
      );
    }
  }, [dispatch, shippingAddress]);

  // const DefaultWard = () => {
  //   let value = customerForm.getFieldsValue();
  //   value.ward_id = null;
  //   customerForm.setFieldsValue(value);
  // };

  const handleSubmit = useCallback(
    (value: any) => {
      //let shippingAddress = customerItem.shipping_addresses.find((p:any) => p.is_default === true);
      let area = areas.find((area: any) => area.id === value.district_id);
      let param = {
        ...shippingAddress,
        name: value.name,
        district_id: value.district_id,
        city_id: area ? area.city_id : null,
        phone: value.phone,
        ward_id: value.ward_id,
        full_address: value.full_address,
        is_default: true,
      };
      if(shippingAddress){
          dispatch(
              UpdateShippingAddress(
                  shippingAddress?.id,
                  customer.id,
                  param,
                  (data: any) => {
                      if (data) {
                          dispatch(
                              getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                                  handleChangeCustomer(datas);
                              })
                          );

                          //if(data!==null) ShippingAddressChange(data);
                          setVisibleBtnUpdate(false);
                          showSuccess("Cập nhật địa chỉ giao hàng thành công");
                      } else {
                          showError("Cập nhật địa chỉ giao hàng thất bại");
                      }
                  }
              )
          );
      }else {
          param.country_id = 233
          param.country = "VIETNAM"
          dispatch(
              CreateShippingAddress(
                  customer.id,
                  param,
                  (data: ShippingAddress) => {
                      if (data) {
                          dispatch(
                              getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                                  handleChangeCustomer(datas);
                              })
                          );

                          //if(data!==null) ShippingAddressChange(data);
                          setVisibleBtnUpdate(false);
                          showSuccess("Thêm mới địa chỉ giao hàng thành công");
                      } else {
                          showError("Thêm mới địa chỉ giao hàng thất bại");
                      }
                  }
              )
          );
      }

    },
    [dispatch, customer, areas, shippingAddress, handleChangeCustomer]
  );

  const onOkPress = useCallback(() => {
    shippingAddressForm.submit();
  }, [shippingAddressForm]);

  const handleCancelValueFormAddress = useCallback(() => {
    if (shippingAddress) {
      shippingAddressForm.setFieldsValue({
        card_number: customer.card_number,
        name: shippingAddress?.name,
        district_id: shippingAddress?.district_id,
        country_id: shippingAddress?.country_id,
        city_id: shippingAddress?.city_id,
        phone: shippingAddress?.phone,
        ward_id: shippingAddress?.ward_id,
        full_address: shippingAddress?.full_address,
      })
    }else {
      shippingAddressForm.setFieldsValue({
        card_number: customer.card_number,
          name: customer.full_name,
          district_id: customer.district_id,
          country_id: customer.country_id,
          phone: customer.phone,
          ward_id: customer.ward_id,
          full_address: customer.full_address,
          gender: customer.gender,
     })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddressForm])

  useEffect(() => {
    if (shippingAddress) shippingAddressForm.resetFields();
  }, [shippingAddressForm, shippingAddress]);

  return (
    <StyledComponent>
      <Row style={{ margin: "10px 0px", display: "none", justifyContent: "space-between", alignItems: "center" }}>
        <div className="page-filter-left font-weight-500">ĐỊA CHỈ GIAO HÀNG</div>
          {isVisibleBtnUpdate && shippingAddress && (
              <Button
                  type="primary"
                  style={{ height: 24, padding: "0 10px", fontWeight: 400, float: "right" }}
                  className="create-button-custom ant-btn-outline fixed-button"
                  onClick={(e) => {
                      e.stopPropagation();
                      onOkPress();
                  }}
              >
                  Cập nhật địa chỉ
              </Button>
          )}
          {isVisibleBtnUpdate && !shippingAddress && (
              <Button
                  type="primary"
                  style={{ height: 24, padding: "0 10px", fontWeight: 400, float: "right" }}
                  className="create-button-custom ant-btn-outline fixed-button"
                  onClick={(e) => {
                      e.stopPropagation();
                      onOkPress();
                  }}
              >
                  Thêm mới địa chỉ
              </Button>
          )}
      </Row>
      <Form
        layout="vertical"
        form={shippingAddressForm}
        ref={formRefAddress}
        onFinish={handleSubmit}
        initialValues={initialFormValueshippingAddress}
        name="shippingAddress_update"
        className="update-customer-ydpage"
      >
        <Row gutter={12}>
          <Col span={12}>
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
              name="name"
            >
              <Input
                placeholder="Nhập Tên khách hàng"
                prefix={<UserOutlined style={{ color: "#71767B" }} />}
                disabled={disableInput}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Số điện thoại",
                },
                {
                  whitespace: true,
                  message: "Vui lòng nhập Số điện thoại",
                },
              ]}
              name="phone"
            >
              <Input
                placeholder="Nhập số điện thoại"
                prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
                disabled={disableInput}
              />
            </Form.Item>
          </Col>
          <Col span={12} hidden>
            <Form.Item
              name="card_number"
              style={customer ? { marginBottom: "0px" } : {}}
            >
              <Input
                placeholder="Nhập mã thẻ"
                prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}
                disabled={disableInput}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
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
                onChange={(value: number) => {
                  let values = formRefAddress.current?.getFieldsValue();
                  values.ward_id = null;
                  formRefAddress.current?.setFieldsValue(values);
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

          <Form.Item label="city" name="city_id" hidden>
            <Input />
          </Form.Item>



          <Col span={24}>
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

    

          <Col span={24}>
            <Form.Item
              name="full_address"
              style={customer ? { marginBottom: "0px" } : {}}
            >
              <Input
                placeholder="Địa chỉ"
                prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                disabled={disableInput}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {!disableInput && (
        <div>
          <div>
            {!isVisibleCollapseCustomer && (
              <Row style={{ margin: 0, color: "#5656A1", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div className="page-filter-left" style={{ width: "15%" }}>
									<Button
										type="link"
										className="btn-style"
										style={{ padding: "0px" }}
										onClick={() => setVisibleModalChangeAddress(true)}
									>
										Đổi địa chỉ giao hàng
									</Button>
									<Modal
										visible={visibleModalChangeAddress}
										cancelText="Đóng"
										onCancel={() => setVisibleModalChangeAddress(false)}
									>
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
										<CustomerShippingAddressOrder
											customer={customer}
											handleChangeCustomer={handleChangeCustomer}
											handleShippingEdit={ShowAddressModalEdit}
											handleShippingDelete={showAddressModalDelete}
											handleSingleShippingAddress={setSingleShippingAddress}
											handleShippingAddress={ShippingAddressChange}
											setVisibleChangeAddress={setVisibleModalChangeAddress}
										/>
									</Modal>
                </div>
        
                <div className="page-filter-right" style={{ width: "30%" }}>
                  <Button
                    className="page-cancel-address"
                    onClick={handleCancelValueFormAddress}
                  >
                    Hủy
                  </Button>
                  
                  <Button
                    type="primary"
                    className="page-ok-save-address"
                    onClick={() => onOkPress()}
                  >
                    Lưu
                  </Button>
                </div>
              </Row>
            )}

            {isVisibleCollapseCustomer && (
              <Divider
                orientation="right"
                style={{ color: "#5656A1", marginTop: 0 }}
              >
								<Button
									type="link"
									icon={<PlusOutlined />}
									className="btn-style"
									style={{ paddingRight: 0 }}
									onClick={() => setVisibleModalChangeAddress(false)}
								>
									Thay đổi địa chỉ giao hàng
								</Button>
								<Modal
									visible={visibleModalChangeAddress}
									cancelText="Đóng"
									onCancel={() => setVisibleModalChangeAddress(false)}
								>
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
									<CustomerShippingAddressOrder
										customer={customer}
										handleChangeCustomer={handleChangeCustomer}
										handleShippingEdit={ShowAddressModalEdit}
										handleShippingDelete={showAddressModalDelete}
										handleSingleShippingAddress={setSingleShippingAddress}
									/>
								</Modal>
              </Divider>
            )}
          </div>
          {/* {isVisibleCollapseCustomer && (
            
           <div>
              <Row style={{ margin: "10px 0px" }}>
                <div className="page-filter-left">THÔNG TIN KHÁCH HÀNG</div>
              </Row>
              <Form
              layout="vertical"
              initialValues={initialFormValueCustomer}
              form={customerForm}
              ref={formRefCustomer}
              className="update-customer-ydpage"
            >
              <Row gutter={12}>
                <Col span={12}>
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

                
                <Form.Item label="city" name="city_id" hidden>
                  <Input />
                </Form.Item>

                <Col span={12}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập Số điện thoại",
                      },
                      {
                        whitespace: true,
                        message: "Vui lòng nhập Số điện thoại",
                      },
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
                <Col span={12}>
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
                <Col span={12}>
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
                <Col span={12}>
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
                        handleChangeArea(value);
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
                <Col span={12}>
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
                    >
                      {wards.map((ward: any) => (
                        <Select.Option key={ward.id} value={ward.id}>
                          {ward.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="full_address"
                    //style={customerItem !== null ? { marginBottom: "0px" } : {}}
                  >
                    <Input
                      placeholder="Địa chỉ"
                      prefix={
                        <EnvironmentOutlined style={{ color: "#71767B" }} />
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
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

                <Col span={12}>
                  <Form.Item
                    name="birthday"
                    // label="Ngày sinh"
                    rules={[
                      {
                        validator: async (_, birthday) => {
                          if (birthday && birthday > new Date()) {
                            return Promise.reject(
                              new Error(
                                "Ngày sinh không được lớn hơn ngày hiện tại"
                              )
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
                        <CalendarOutlined
                          style={{ color: "#71767B", float: "left" }}
                        />
                      }
                    />
                  </Form.Item>
                </Col>

                
              </Row>
            </Form>
           </div>
          )} */}

          {/* {isVisibleCollapseCustomer && (
            <Divider
              orientation="left"
              style={{ padding: 0, margin: 0, color: "#5656A1" }}
            >
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
          )} */}
        </div>
      )}
    </StyledComponent>
  );
};
export default UpdateCustomer;
