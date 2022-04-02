import {
  BarcodeOutlined,
  CalendarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  TeamOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from "antd";
import CustomSelect from "component/custom/select.custom";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import {
  CustomerCreateAction,
} from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerContactClass,
  CustomerModel,
  CustomerShippingAddress,
  CustomerShippingAddressClass,
} from "model/request/customer.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import moment from "moment";
import React, { createRef, useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";

type CreateCustomerProps = {
  areas: any;
  groups: any;
  handleChangeCustomer: any;
  keySearchCustomer: string;
  ShippingAddressChange: (items: any) => void;
  CustomerDeleteInfo: () => void;
};

const CreateCustomer: React.FC<CreateCustomerProps> = (props) => {
  const {
    areas,
    groups,
    handleChangeCustomer,
    keySearchCustomer,
    CustomerDeleteInfo
  } = props;

  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRef = createRef<FormInstance>();

  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);

  const [isVisibleShipping, setVisibleShipping] = useState(true);
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
          .replace("thanh pho ", "")
          .replace("thi xa ", ""),
      }
    })
  }, [areas]);
  var pattern = new RegExp(RegUtil.PHONE);
  const initialFormValueCustomer ={
      phone:  pattern.test(keySearchCustomer)?keySearchCustomer:"",
      shipping_addresses_phone:"",
      //birthday:moment("01/01/1991", "DD/MM/YYYY")
    }

  useLayoutEffect(() => {
    const txtCustomerFullName: any = document.getElementById("customer_add_full_name");
    const txtCustomerPhone = document.getElementById("customer_add_phone");
    const txtCustomerNumber = document.getElementById("customer_add_card_number");
    const txtCustomerFullAddress = document.getElementById("customer_add_full_address");
    //
    const txtShippingAddName = document.getElementById("customer_add_shipping_addresses_name");
    const txtShippingAddPhone = document.getElementById("customer_add_shipping_addresses_phone");
    const txtShippingFullAddress = document.getElementById("customer_add_shipping_addresses_full_address");

    //event
    txtCustomerFullName?.addEventListener("change", (e: any) => {
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
    txtShippingAddName?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });
    txtShippingAddPhone?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });
    txtShippingFullAddress?.addEventListener("change", (e: any) => {
      setVisibleBtnUpdate(true);
    });
  });

  const getWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, (data) => {
          const value = formRef.current?.getFieldValue("full_address");
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
            formRef.current?.setFieldsValue({
              ward_id: findWard ? findWard.id : null,
            })
            
          }
          setWards(data);
        }));
      }
    },
    [dispatch, formRef]
  );

  const getShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, (data) => {
          const value = formRef.current?.getFieldValue("shipping_addresses_full_address");
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
                .toLowerCase().replace("phuong ", "")
                .replace("xa ", ""),
              }
            });
            const findWard = newWards.find((ward: any) => newValue.indexOf(ward.ward_name_normalize) > -1);
            formRef.current?.setFieldsValue({
              shipping_addresses_ward_id: findWard ? findWard.id : null,
            })
          }
          setShippingWards(data);
        }));

      }
    },
    [dispatch, formRef]
  );

  const createCustomerCallback = useCallback(
    (result: CustomerResponse) => {
      if (result !== null && result !== undefined) {
        showSuccess("Thêm mới khách hàng thành công");

        handleChangeCustomer({ ...result, version: 1 });
        setVisibleBtnUpdate(false);
      }
    },
    [handleChangeCustomer]
  );

  const handleSubmit = useCallback(
    (values: any) => {
      let area = newAreas.find((area: any) => area.id === values.district_id);
      values.full_name = values.full_name.trim();

      let area_shipping_district = newAreas.find((area: any) => area.id === values.shipping_addresses_district_id);
      let area_shipping_ward=shippingWards.find((ward:any)=>ward.id===values.shipping_addresses_ward_id)

      let customer_district = newAreas.find((area: any) => area.id === values.district_id);
      let customer_ward= wards.find((ward:any)=>ward.id===values.ward_id);

      let shipping_addresses: CustomerShippingAddress[] | null = isVisibleShipping === false ? [
        {
          ...new CustomerShippingAddressClass(),
          is_default: true,
          default: true,
          name: values.shipping_addresses_name,
          phone: values.shipping_addresses_phone,
          country_id: VietNamId,
          city_id: area ? area.city_id : null,
          city: area_shipping_district.city_name,
          district_id: values.shipping_addresses_district_id,
          district:area_shipping_district.name,
          ward_id: values.shipping_addresses_ward_id,
          ward:area_shipping_ward?.name||"",
          full_address: values.shipping_addresses_full_address,
        }
      ] : null;

      let piece: any = {
        full_name: values.full_name.trim(),
        phone: values.phone,
        city_id: area ? area.city_id : null,
        city: customer_district.city_name,
        district_id: values.district_id,
        district:customer_district.name,
        ward_id: values.ward_id,
        ward: customer_ward?.name,
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
        shipping_addresses: shipping_addresses
      };
      dispatch(
        CustomerCreateAction({ ...new CustomerModel(), ...piece }, createCustomerCallback)
      );
    },
    [dispatch, createCustomerCallback, newAreas, isVisibleShipping,shippingWards,wards]
  );

  const onOkPress = useCallback(() => {
    customerForm.submit();
    setVisibleBtnUpdate(false);
  }, [customerForm]);

  const checkAddress = useCallback((type, value) => {
    const newValue = value.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
      
    const findArea = newAreas.find((area: any) => newValue.indexOf(area.city_name_normalize) > -1 && newValue.indexOf(area.district_name_normalize) > -1);
    if (findArea) {
      switch (type) {
        case "full_address":
          if (formRef.current?.getFieldValue("district_id") !== findArea.id) {
            formRef.current?.setFieldsValue({
              district_id: findArea.id,
              ward_id: null
            })
            getWards(findArea.id);
          }
          break;
        case "shipping_addresses_full_address":
          if (formRef.current?.getFieldValue("shipping_addresses_district_id") !== findArea.id) {
            formRef.current?.setFieldsValue({
              shipping_addresses_district_id: findArea.id,
              shipping_addresses_ward_id: null
            })
            getShippingWards(findArea.id);
          }
          break;  
        default: break;  
      }
      
    }
  }, [formRef, getShippingWards, getWards, newAreas]);


  return (
    <>
      <Form
        form={customerForm}
        ref={formRef}
        name="customer_add"
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={initialFormValueCustomer}
      >
        <Row style={{ margin: "-17px 0px 10px 0px" }}>
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
                id="customer_add_full_name"
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
              <CustomSelect
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
                  getWards(value);
                  let values = formRef.current?.getFieldsValue();
                  values.ward_id = null;
                  formRef.current?.setFieldsValue(values);
                  setVisibleBtnUpdate(true);
                }}
                optionFilterProp="children"
              >
                {newAreas.map((area: any) => (
                  <Select.Option key={area.id} value={area.id}>
                    {area.city_name + ` - ${area.name}`}
                  </Select.Option>
                ))}
              </CustomSelect>
            </Form.Item>
          </Col>
          <Form.Item label="city" name="city_id" hidden>
            <Input />
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
            <Form.Item name="card_number">
              <Input
                placeholder="Nhập mã thẻ"
                prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item name="full_address">
              <Input
                placeholder="Địa chỉ"
                prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                onChange={(e) => checkAddress("full_address", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        {isVisibleCollapseCustomer === false && (
          <Divider orientation="left" style={{ padding: 0, margin: 0 }}>
            <div>
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
          </Divider>
        )}
        {isVisibleCollapseCustomer === true && (
          <div>
            <Row gutter={24}>
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
                    // defaultPickerValue={moment("01/01/1991", "DD/MM/YYYY")}
                    suffixIcon={
                      <CalendarOutlined style={{ color: "#71767B", float: "left" }} />
                    }
                    onChange={() => {
                      setVisibleBtnUpdate(true);
                    }}
                    onMouseLeave={() => {
                      const elm = document.getElementById("customer_add_birthday");
                      const newDate = elm?.getAttribute('value') ? moment(elm?.getAttribute('value'), "DD/MM/YYYY") : undefined
                      if (newDate ) {
                        formRef.current?.setFields([
                          {
                            name: "birthday",
                            value: newDate,
                            errors: newDate > moment(new Date(), "DD/MM/YYYY") ? ["Ngày sinh không được lớn hơn ngày hiện tại"] : []
                          }
                        ])
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
        {/* </Form> */}

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

        <div className="send-order-box">
          <Row gutter={12} style={{ marginTop: 15 }}>
            <Col md={12}>
              <Checkbox
                className="checkbox-style"
                onChange={() => {
                  setVisibleShipping(!isVisibleShipping);
                }}
                style={{ marginLeft: "3px" }}
                checked={isVisibleShipping}
              //disabled={levelOrder > 3}
              >
                Thông tin của khách hàng cũng là thông tin giao hàng
              </Checkbox>
            </Col>
            {isVisibleShipping === true && (
              <Col md={12} style={{ float: "right", marginTop: "-10px" }}>
                {isVisibleBtnUpdate === true && (
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
                  className="ant-btn-outline fixed-button cancle-button"
                  onClick={() => {
                    CustomerDeleteInfo();
                  }}
                >
                  Hủy
                </Button>
              </Col>
            )}
          </Row>

          {isVisibleShipping === false && (
            // <Form ref={shippingFormRef} layout="vertical" name="shippingAddress_add">
            <>
              <Row style={{ margin: "10px 0px 10px 0px" }}>
                <div className="page-filter-left">THÔNG TIN GIAO HÀNG</div>
              </Row>
              <Row gutter={24} style={{ marginTop: "14px" }}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên người nhận",
                      },
                      {
                        whitespace: true,
                        message: "Vui lòng nhập tên người nhận",
                      },
                    ]}
                    name="shipping_addresses_name"
                  >
                    <Input
                      placeholder="Nhập Tên người nhận"
                      prefix={<UserOutlined style={{ color: "#71767B" }} />}
                    //suffix={<img src={arrowDownIcon} alt="down" />}
                    />
                  </Form.Item>
                </Col>
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
                    name="shipping_addresses_phone"
                  //label="Số điện thoại"
                  >
                    <Input
                      placeholder="Nhập số điện thoại người nhận"
                      prefix={<PhoneOutlined style={{ color: "#71767B" }} />}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="shipping_addresses_district_id"
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
                        let values = customerForm.getFieldsValue();
                        values.shipping_addresses_ward_id = null;
                        customerForm.setFieldsValue(values);
                        getShippingWards(value);
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
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="shipping_addresses_ward_id"
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
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="shipping_addresses_full_address"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Địa chỉ"
                      prefix={<EnvironmentOutlined style={{ color: "#71767B" }} />}
                      onChange={(e) => checkAddress("shipping_addresses_full_address", e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
            // </Form>
          )}
        </div>
      </Form>
      {isVisibleShipping === false && (
        <Row style={{ marginTop: 15 }}>
          <Col md={24} style={{ float: "right", marginTop: "-10px" }}>
            {isVisibleBtnUpdate === true && (
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
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => {
                CustomerDeleteInfo();
              }}
            >
              Hủy
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CreateCustomer;
