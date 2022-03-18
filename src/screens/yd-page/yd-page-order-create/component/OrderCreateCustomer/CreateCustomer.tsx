import {
  BarcodeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Button, Checkbox, Col, DatePicker, Form, FormInstance, Input,
  Row,
  Select
} from "antd";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import {
  CreateShippingAddress,
  CustomerCreateAction,
  getCustomerDetailAction,
  UpdateShippingAddress
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerContactClass,
  CustomerModel,
  CustomerShippingAddress, CustomerShippingAddressClass,
  YDpageCustomerRequest
} from "model/request/customer.request";
import {BillingAddress, CustomerResponse} from "model/response/customer/customer.response";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import {StyledComponent} from "./styles";
import {VietNamId} from "utils/Constants";

type CreateCustomerProps = {
  newCustomerInfo?: YDpageCustomerRequest;
  areaList: any;
  wards: any;
  customerGroups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  keySearchCustomer: string;
  ShippingAddressChange: (items: any) => void;
  CustomerDeleteInfo: () => void;
  setBillingAddress: (items: BillingAddress | null) => void;
  setCustomer: (items: CustomerResponse | null) => void;
};

const CreateCustomer: React.FC<CreateCustomerProps> = (props) => {
  const {
    newCustomerInfo,
    areaList,
    wards,
    customerGroups,
    handleChangeArea,
    handleChangeCustomer,
    ShippingAddressChange,
    keySearchCustomer,
    CustomerDeleteInfo,
    setBillingAddress,
    setCustomer,
  } = props;

  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const shippingFormRef = createRef<FormInstance>();
  const [isVisibleShipping, setVisibleShipping] = useState(true);
  const [isVisibleBtnUpdate, setVisibleBtnUpdate] = useState(true);

  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>(
    []
  );

  var pattern = new RegExp(RegUtil.PHONE);
  const initialFormValueCustomer = pattern.test(keySearchCustomer) ? {
        ...customerForm.getFieldsValue(), ...new CustomerModel(),
    phone: keySearchCustomer,
  } : {...customerForm.getFieldsValue(), ...new CustomerModel()};

  //element
  const txtCustomerFullname = document.getElementById("customer_add_full_name");
  const txtCustomerPhone = document.getElementById("customer_add_phone");
  const txtCustomerNumber = document.getElementById("customer_add_card_number");
  const txtCustomerFullAddress = document.getElementById(
    "customer_add_full_address"
  );
  const txtCustomerBirthday = document.getElementById("customer_add_birthday");
  //
  const txtShippingAddName = document.getElementById(
    "shippingAddress_add_name"
  );
  const txtShippingAddPhone = document.getElementById(
    "shippingAddress_add_phone"
  );
  const txtShippingFullAddress = document.getElementById(
    "shippingAddress_add_full_address"
  );

  //event
  txtCustomerFullname?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtCustomerPhone?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtCustomerNumber?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtCustomerFullAddress?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtCustomerBirthday?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtShippingAddName?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtShippingAddPhone?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  txtShippingFullAddress?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });

  useEffect(() => {
    if (newCustomerInfo && (newCustomerInfo.full_name || newCustomerInfo.phone)) {
      const formValue = {...customerForm.getFieldsValue(), ...newCustomerInfo};
      customerForm.setFieldsValue(formValue);
    }
  }, [customerForm, newCustomerInfo]);

  const DefaultWard = () => {
    let value = customerForm.getFieldsValue();
    value.ward_id = null;
    customerForm.setFieldsValue(value);
  };

  const handleShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, setShippingWards));
      }
    },
    [dispatch]
  );

  const handleClearArea = () => {
    let value = customerForm.getFieldsValue();
    value.district_id = null;
    value.ward_id = null;
    value.full_address = "";
    customerForm.setFieldsValue(value);

    handleChangeArea && handleChangeArea(null);
  };

  const createCustomerCallback = useCallback(
    (result: CustomerResponse) => {
      if (result !== null && result !== undefined) {
        showSuccess("Thêm mới khách hàng thành công");

        // update customer, shipping address, billing address
        const shippingAddress = result.shipping_addresses.find((item: any) => item.default);
        ShippingAddressChange(shippingAddress);

        const billingAddress = result.billing_addresses.find(item => item.default) || null;
        setBillingAddress(billingAddress);
        setCustomer(result);

        // Mặc định: isVisibleShipping === true
        if (!isVisibleShipping) {
          shippingFormRef.current?.validateFields();

          let district_id =
            shippingFormRef.current?.getFieldValue("district_id");
          let area = areaList.find((area: any) => area.id === district_id);

          let shippingAddress = {
            id: 0,
            is_default: false,
            default: false,
            country: "",
            city: "",
            district: "",
            ward: "",
            zip_code: "",
            customer_id: 0,
            created_by: null,
            created_name: "",
            updated_by: null,
            updated_name: "",
            request_id: "",
            operator_kc_id: "",
            name: shippingFormRef.current?.getFieldValue("name"),
            phone: shippingFormRef.current?.getFieldValue("phone"),
            country_id: 233,
            district_id: shippingFormRef.current?.getFieldValue("district_id"),
            ward_id: shippingFormRef.current?.getFieldValue("ward_id"),
            city_id: area ? area.city_id : null,
            full_address:
              shippingFormRef.current?.getFieldValue("full_address"),
          };

          dispatch(
            CreateShippingAddress(
              result.id,
              shippingAddress,
              (data: CustomerShippingAddress) => {
                if (data) {
                  dispatch(
                    UpdateShippingAddress(
                      data.id,
                      result.id,
                      {...data,is_default:true},
                      (data: any) => {
                        if (data) {
                          dispatch(
                            getCustomerDetailAction(
                              result.id,
                              (data_i: CustomerResponse) => {
                                handleChangeCustomer(data_i);

                                let shippingAddressesItem =
                                  data_i.shipping_addresses.find(
                                    (x) => x.default
                                  );
                                ShippingAddressChange(shippingAddressesItem);
                                setVisibleBtnUpdate(false);
                                // showSuccess(
                                //   "Cập nhật địa chỉ giao hàng thành công"
                                // );
                              }
                            )
                          );
                          //if(data!==null) ShippingAddressChange(data);
                        } else {
                          showError("Cập nhật địa chỉ giao hàng thất bại");
                        }
                      }
                    )
                  );
                } else {
                  showError("Thêm địa chỉ thất bại");
                }
              }
            )
          );
        } else {
          handleChangeCustomer(result);
          setVisibleBtnUpdate(false);
        }
      }
    },
    [
      setCustomer,
      dispatch,
      handleChangeCustomer,
      areaList,
      shippingFormRef,
      isVisibleShipping,
      ShippingAddressChange,
      setBillingAddress,
    ]
  );

  const handleSubmit = useCallback(
    (values: any) => {
      const area = areaList.find((area: any) => area.id.toString() === values.district_id.toString());
      const area_ward = wards.find((ward:any) => ward.id.toString() === values.ward_id.toString());

      values.full_name = values.full_name.trim();

      let shipping_addresses: CustomerShippingAddress[] | null = [
        {
          ...new CustomerShippingAddressClass(),
          is_default: true,
          default: true,
          name: values.full_name,
          phone: values.phone,
          country_id: VietNamId,
          city_id: area ? area.city_id : null,
          city: area?.city_name,
          district_id: values.district_id,
          district:area?.name,
          ward_id: values.ward_id,
          ward: area_ward?.name || "",
          full_address: values.full_address,
        }
      ];

      const customerParams = {
        full_name: values.full_name.trim(),
        phone: values.phone,
        city_id: area ? area.city_id : null,
        city: area?.city_name,
        district_id: values.district_id,
        district: area?.name,
        ward_id: values.ward_id,
        ward: area_ward?.name || "",
        card_number: values.card_number,
        full_address: values.full_address,
        gender: values.gender,
        birthday: values.birthday ? new Date(values.birthday).toUTCString() : null,
        customer_group_id: values.customer_group_id,
        wedding_date: values.wedding_date
          ? new Date(values.wedding_date).toUTCString()
          : null,
        status: "active",
        country_id: VietNamId,
        contacts: [
          {
            ...CustomerContactClass,
            name: values.contact_name,
            phone: values.contact_phone,
            note: values.contact_note,
            email: values.contact_email,
          },
        ],
        shipping_addresses: shipping_addresses,
      };
      
      dispatch(
        CustomerCreateAction(
          { ...new CustomerModel(), ...customerParams },
          createCustomerCallback
        )
      );
    },
    [areaList, wards, dispatch, createCustomerCallback]
  );

  const onOkPress = useCallback(() => {
    const value = customerForm.getFieldsValue();
    if (!value.full_name) {
      showError("Vui lòng nhập tên khách hàng");
    }

    if (!value.phone) {
      showError("Vui lòng nhập Số điện thoại");
    }

    if (!value.district_id) {
      showError("Vui lòng chọn khu vực");
    }

    if (!value.ward_id) {
      showError("Vui lòng chọn phường xã");
    }

    if (!value.full_address) {
      showError("Vui lòng nhập địa chỉ giao hàng");
    }

    if (
      !value.phone
      &&
      !value.ward_id
      &&
      !value.district_id
      &&
      !value.full_address
    ) {
      showError("Vui lòng điền đầy đủ thông tin");
    }

    customerForm.submit();
  }, [customerForm]);

  return (
    <StyledComponent>
      <Form
        form={customerForm}
        ref={formRef}
        name="customer_add"
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={initialFormValueCustomer}
        className="update-customer-ydpage"
      >
        <div style={{ marginBottom: 12, fontWeight: "bold", textTransform: "uppercase" }}>Tạo mới khách hàng</div>
        <Row gutter={12} >
          <Col span={12} >
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
            <Form.Item name="card_number">
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
                    onChange={() => {
                      setVisibleBtnUpdate(true);
                    }}
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
                onChange={(value) => {
                  handleChangeArea(value);
                  DefaultWard();
                  setVisibleBtnUpdate(true);
                }}
                onClear={handleClearArea}
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
              rules= {[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ giao hàng"
                }
              ]}
            >
              <Input
                placeholder="Địa chỉ"
                prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
              />
            </Form.Item>
          </Col>
        </Row>
				<Row gutter={24}>
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
								// defaultValue={moment("01/01/1991", "DD/MM/YYYY")}
								suffixIcon={
									<CalendarOutlined
										style={{ color: "#71767B", float: "left" }}
									/>
								}
								onChange={() => {
									setVisibleBtnUpdate(true);
								}}
							/>
						</Form.Item>
					</Col>
				</Row>
      </Form>

      {/*Mặc định địa chỉ khách hàng là địa chỉ giao hàng: isVisibleShipping === true*/}
      <div className="send-order-box">
        <Row gutter={12}>
          <Col md={12} hidden>
            <Checkbox
              className={isVisibleShipping ? "checkbox-style send-order-box-default" : "checkbox-style"}
              onChange={() => {
                setVisibleShipping(!isVisibleShipping);
              }}
              style={{ marginLeft: "3px" }}
              checked={isVisibleShipping}
              disabled={isVisibleShipping}
            >
              Thông tin của khách hàng cũng là thông tin giao hàng
            </Checkbox>
          </Col>

          {isVisibleShipping && (
            <Col md={24} style={{ float: "right", marginTop: "10px", width: "100%" }}>
              {isVisibleBtnUpdate && (
                <>
                  <Button
                    type="primary"
                    style={{ padding: "0 15px", fontWeight: 400, float: "right", height: "24px" }}
                    className="create-button-custom ant-btn-outline fixed-button"
                    onClick={() => {
                      onOkPress();
                    }}
                  >
                    Thêm mới
                  </Button>

                  <Button
                    style={{ float: "right", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    type="default"
                    onClick={() => {
                      CustomerDeleteInfo();
                    }}
                    >
                    Hủy
                  </Button>
                </>
              )}
            </Col>
          )}
        </Row>

        {!isVisibleShipping && (
          <Form
            ref={shippingFormRef}
            layout="vertical"
            name="shippingAddress_add"
            className="update-customer-ydpage"
          >
            <Row gutter={12} style={{ marginTop: "8px" }}>
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
                    //suffix={<img src={arrowDownIcon} alt="down" />}
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
                  ]}
                  name="phone"
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>

                <Form.Item
                  name="district_id"
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
                      let values = shippingFormRef.current?.getFieldsValue();
                      values.ward_id = null;
                      shippingFormRef.current?.setFieldsValue(values);
                      handleShippingWards(value);
                      setVisibleBtnUpdate(true);
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
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phường xã",
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
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ",
                    },
                  ]}
                >
                  <Input
                    placeholder="Địa chỉ"
                    prefix={
                      <EnvironmentOutlined style={{ color: "#71767B" }} />
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </div>

      {!isVisibleShipping && (
        <Row style={{ marginTop: 15 }}>
          <Col md={24} style={{ float: "right", marginTop: "-10px" }}>
            {isVisibleBtnUpdate && (
              <Button
                type="primary"
                style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
                className="create-button-custom ant-btn-outline fixed-button"
                onClick={() => {
                  onOkPress();
                }}
              >
                Thêm mới
              </Button>
            )}

            <Button
              style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
              type="default"
              onClick={() => {
                CustomerDeleteInfo();
              }}
            >
              Hủy
            </Button>
          </Col>
        </Row>
      )}
    </StyledComponent>
  );
};

export default CreateCustomer;
