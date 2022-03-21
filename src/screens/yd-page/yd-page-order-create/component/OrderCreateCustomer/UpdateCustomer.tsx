import {
  // BarcodeOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Button, 
	Col, 
	// Divider,
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
import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch } from "react-redux";
import CustomerShippingAddressOrder from "screens/yd-page/yd-page-order-create/component/OrderCreateCustomer/customer-shipping";
import { showError, showSuccess } from "utils/ToastUtils";
import {StyledComponent} from "./styles";

type UpdateCustomerProps = {
  areaList: any;
  wards: any;
  customerGroups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  customer: any;
  shippingAddress: ShippingAddress | any;
  levelOrder?: number;
  setSingleShippingAddress: (item: CustomerShippingAddress | null) => void;
  setShippingAddress: (items: any) => void;
  ShowAddressModalEdit: () => void;
  showAddressModalDelete: () => void;
  ShowAddressModalAdd: () => void;
};

const UpdateCustomer: React.FC<UpdateCustomerProps> = (props) => {
  const {
    areaList,
    handleChangeCustomer,
    customer,
    shippingAddress,
    levelOrder = 0,
    setSingleShippingAddress,
    setShippingAddress,
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
  // const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);

  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(false);
  const [visibleModalChangeAddress, setVisibleModalChangeAddress] = useState(false)

  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>(
    []
  );

  //const [shippingDistrictId, setShippingDistrictId] = React.useState<any>(null);

  const getWardByDistrictId = useCallback(
    (districtId: number) => {
      if (districtId) {
        dispatch(WardGetByDistrictAction(districtId, setShippingWards));
      }
    },
    [dispatch]
  );
  
  //properties
  const disableInput = levelOrder >= 4;

  const initialFormValues = useMemo(() => {
    if (shippingAddress) {
      return {
        name: shippingAddress?.name,
        phone: shippingAddress?.phone,
        district_id: shippingAddress?.district_id,
        ward_id: shippingAddress?.ward_id,
        full_address: shippingAddress?.full_address,
      };
    } else {
      return {
        name: customer.full_name,
        phone: customer.phone,
        district_id: customer.district_id,
        ward_id: customer.ward_id,
        full_address: customer.full_address,
      };
    }
  }, [customer.district_id, customer.full_address, customer.full_name, customer.phone, customer.ward_id, shippingAddress]);


  useEffect(() => {
    if (shippingAddress && shippingAddress.district_id) {
      dispatch(
        WardGetByDistrictAction(shippingAddress.district_id, setShippingWards)
      );
    } else {
      setShippingWards([]);
    }
  }, [dispatch, shippingAddress]);

  // const DefaultWard = () => {
  //   let value = customerForm.getFieldsValue();
  //   value.ward_id = null;
  //   customerForm.setFieldsValue(value);
  // };

  const handleSelectArea = (value: any) => {
    let values = formRefAddress.current?.getFieldsValue();
    values.ward_id = null;
    shippingAddressForm.setFieldsValue(values);
    getWardByDistrictId(value);
    setVisibleBtnUpdate(true);
  };

  const handleClearArea = () => {
    let value = shippingAddressForm.getFieldsValue();
    value.district_id = null;
    value.ward_id = null;
    value.full_address = "";
    shippingAddressForm.setFieldsValue({...value});

    setShippingWards([]);
  };

  const handleSubmit = useCallback(
    (value: any) => {
      //let shippingAddress = customerItem.shipping_addresses.find((p:any) => p.is_default === true);
      let area = areaList.find((area: any) => area.id === value.district_id);
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
      if(shippingAddress && shippingAddress.id){
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

                          //if(data!==null) setShippingAddress(data);
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

                          //if(data!==null) setShippingAddress(data);
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
    [dispatch, customer, areaList, shippingAddress, handleChangeCustomer]
  );

  const onOkPress = useCallback(() => {
    const formValues = shippingAddressForm.getFieldsValue();
    if (!formValues.district_id) {
      showError("Vui lòng chọn khu vực!");
    } else if (!formValues.ward_id) {
      showError("Vui lòng chọn phường/xã!");
    } else if (!formValues.full_address) {
      showError("Vui lòng nhập địa chỉ chi tiết!");
    }
    shippingAddressForm.submit();
  }, [shippingAddressForm]);

  const onCancelUpdateShippingAddress = useCallback(() => {
    const districtValue = shippingAddressForm.getFieldValue("district_id");
    if (initialFormValues.district_id?.toString() !== districtValue?.toString()) {
      if (initialFormValues.district_id ) {
        getWardByDistrictId(initialFormValues.district_id);
      } else {
        setShippingWards([]);
      }
    }
    shippingAddressForm.setFieldsValue(initialFormValues);
  }, [getWardByDistrictId, initialFormValues, shippingAddressForm])

  useEffect(() => {
    shippingAddressForm.setFieldsValue(initialFormValues);
  }, [shippingAddressForm, shippingAddress, initialFormValues]);


  useEffect(() => {
    if (customer) {
      if (customer.shipping_addresses?.length > 0) {
        const shippingAddressesDefault = customer.shipping_addresses.find((item: any) => item.default) || null;
        setShippingAddress(shippingAddressesDefault);
      } else {
        setShippingAddress(null);
      }
    } else {
      setShippingAddress(null);
    }
  }, [dispatch, customer, setShippingAddress]);
  

  return (
    <StyledComponent>
      {/*display: none*/}
      {/*<Row style={{ margin: "10px 0px", display: "none", justifyContent: "space-between", alignItems: "center" }}>*/}
      {/*  <div className="page-filter-left font-weight-500">ĐỊA CHỈ GIAO HÀNG</div>*/}
      {/*    {isVisibleBtnUpdate && shippingAddress && (*/}
      {/*        <Button*/}
      {/*            type="primary"*/}
      {/*            style={{ height: 24, padding: "0 10px", fontWeight: 400, float: "right" }}*/}
      {/*            className="create-button-custom ant-btn-outline fixed-button"*/}
      {/*            onClick={(e) => {*/}
      {/*                e.stopPropagation();*/}
      {/*                onOkPress();*/}
      {/*            }}*/}
      {/*        >*/}
      {/*            Cập nhật địa chỉ*/}
      {/*        </Button>*/}
      {/*    )}*/}
      {/*    {isVisibleBtnUpdate && !shippingAddress && (*/}
      {/*        <Button*/}
      {/*            type="primary"*/}
      {/*            style={{ height: 24, padding: "0 10px", fontWeight: 400, float: "right" }}*/}
      {/*            className="create-button-custom ant-btn-outline fixed-button"*/}
      {/*            onClick={(e) => {*/}
      {/*                e.stopPropagation();*/}
      {/*                onOkPress();*/}
      {/*            }}*/}
      {/*        >*/}
      {/*            Thêm mới địa chỉ*/}
      {/*        </Button>*/}
      {/*    )}*/}
      {/*</Row>*/}

      <Form
        layout="vertical"
        form={shippingAddressForm}
        ref={formRefAddress}
        onFinish={handleSubmit}
        initialValues={initialFormValues}
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
                onChange={() => setVisibleBtnUpdate(true)}
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
                onChange={() => setVisibleBtnUpdate(true)}
              />
            </Form.Item>
          </Col>

          {/*hidden*/}
          {/*<Col span={12} hidden>*/}
          {/*  <Form.Item*/}
          {/*    name="card_number"*/}
          {/*    style={customer ? { marginBottom: "0px" } : {}}*/}
          {/*  >*/}
          {/*    <Input*/}
          {/*      placeholder="Nhập mã thẻ"*/}
          {/*      prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}*/}
          {/*      disabled={disableInput}*/}
          {/*    />*/}
          {/*  </Form.Item>*/}
          {/*</Col>*/}

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
                onChange={handleSelectArea}
                onClear={handleClearArea}
                optionFilterProp="children"
                disabled={disableInput}
              >
                {areaList.map((area: any) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.city_name + ` - ${area.name}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

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
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ chi tiết",
                },
              ]}
            >
              <Input
                placeholder="Địa chỉ"
                prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                disabled={disableInput}
                onChange={() => setVisibleBtnUpdate(true)}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {!disableInput && (
        <div>
          <div>
            {/*{!isVisibleCollapseCustomer && (*/}
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
											handleShippingAddress={setShippingAddress}
											setVisibleChangeAddress={setVisibleModalChangeAddress}
										/>
									</Modal>
                </div>

                {isVisibleBtnUpdate &&
                  <div className="page-filter-right" style={{width: "30%"}}>
                    <Button
                      className="page-cancel-address"
                      onClick={onCancelUpdateShippingAddress}
                    >
                      Hủy
                    </Button>

                    <Button
                      type="primary"
                      className="page-ok-save-address"
                      onClick={() => onOkPress()}
                    >
                      Lưu địa chỉ
                    </Button>
                  </div>
                }
              </Row>
            {/*)}*/}

            {/*isVisibleCollapseCustomer === false  => hidden*/}
            {/*{isVisibleCollapseCustomer && (*/}
            {/*  <Divider*/}
            {/*    orientation="right"*/}
            {/*    style={{ color: "#5656A1", marginTop: 0 }}*/}
            {/*  >*/}
						{/*		<Button*/}
						{/*			type="link"*/}
						{/*			icon={<PlusOutlined />}*/}
						{/*			className="btn-style"*/}
						{/*			style={{ paddingRight: 0 }}*/}
						{/*			onClick={() => setVisibleModalChangeAddress(false)}*/}
						{/*		>*/}
						{/*			Thay đổi địa chỉ giao hàng*/}
						{/*		</Button>*/}
						{/*		<Modal*/}
						{/*			visible={visibleModalChangeAddress}*/}
						{/*			cancelText="Đóng"*/}
						{/*			onCancel={() => setVisibleModalChangeAddress(false)}*/}
						{/*		>*/}
						{/*			<Row*/}
						{/*				justify="space-between"*/}
						{/*				align="middle"*/}
						{/*				className="change-shipping-address-title"*/}
						{/*				style={{ width: "100%" }}*/}
						{/*			>*/}
						{/*				<div*/}
						{/*					style={{*/}
						{/*						color: "#4F687D",*/}
						{/*					}}*/}
						{/*				>*/}
						{/*					Thay đổi địa chỉ*/}
						{/*				</div>*/}
						{/*				<Button*/}
						{/*					type="link"*/}
						{/*					icon={<PlusOutlined />}*/}
						{/*					onClick={ShowAddressModalAdd}*/}
						{/*				>*/}
						{/*					Thêm địa chỉ mới*/}
						{/*				</Button>*/}
						{/*			</Row>*/}
						{/*			<CustomerShippingAddressOrder*/}
						{/*				customer={customer}*/}
						{/*				handleChangeCustomer={handleChangeCustomer}*/}
						{/*				handleShippingEdit={ShowAddressModalEdit}*/}
						{/*				handleShippingDelete={showAddressModalDelete}*/}
						{/*				handleSingleShippingAddress={setSingleShippingAddress}*/}
						{/*			/>*/}
						{/*		</Modal>*/}
            {/*  </Divider>*/}
            {/*)}*/}
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
                      {customerGroups &&
                        customerGroups.map((group: any) => (
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
                      {areaList.map((area: any) => (
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
