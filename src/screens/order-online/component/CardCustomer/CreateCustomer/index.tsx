import {
  BarcodeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Checkbox, Col, DatePicker, Form, Input, Row, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import { CustomerCreateAction } from "domain/actions/customer/customer.action";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerContactClass,
  CustomerModel,
  CustomerShippingAddress,
  CustomerShippingAddressClass,
} from "model/request/customer.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import moment from "moment";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  findWard,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFindArea,
} from "utils/AppUtils";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import DividerCustom from "./DividerCustom";
import ExecuteCustomer from "./ExecuteCustomer";
import { StyleComponent } from "./style";

type Props = {
  areas: Array<any>;
  groups: Array<any>;
  keySearchCustomer: string;
  setCustomerChange: (value: boolean) => void;
  CustomerDeleteInfo: () => void;
  customerChange: boolean;
  handleChangeCustomer: (customers: CustomerResponse | null) => void;
};

const pattern = new RegExp(RegUtil.PHONE);

const CreateCustomer: React.FC<Props> = (props: Props) => {
  const {
    areas,
    groups,
    keySearchCustomer,
    setCustomerChange,
    customerChange,
    CustomerDeleteInfo,
    handleChangeCustomer,
  } = props;

  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRef = useRef<any>();
  const fullAddressRef = useRef();

  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [shippingWards, setShippingWards] = React.useState<Array<WardResponse>>([]);
  const [isVisibleCollapseCustomer, setVisibleCollapseCustomer] = useState(false);
  const [isVisibleShipping, setVisibleShipping] = useState(true);

  const initialFormValueCustomer = useMemo(() => {
    return {
      phone: pattern.test(keySearchCustomer) ? keySearchCustomer : "",
      shipping_addresses_phone: "",
    };
  }, [keySearchCustomer]);

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
          // .replace("thanh pho ", "")
          .replace("thi xa ", ""),
      };
    });
  }, [areas]);

  const getWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(
          WardGetByDistrictAction(value, (data) => {
            const value = formRef.current?.getFieldValue("full_address");
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
              let district =
                document
                  .getElementsByClassName("inputDistrictCreateCustomer")[0]
                  .textContent?.replace("Vui lòng chọn khu vực", "") || "";
              const foundWard = findWard(district, newWards, newValue);
              formRef.current?.setFieldsValue({
                ward_id: foundWard ? foundWard.id : null,
              });
            }
            setWards(data);
          }),
        );
      }
    },
    [dispatch, formRef],
  );

  const getShippingWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(
          WardGetByDistrictAction(value, (data) => {
            const value = formRef.current?.getFieldValue("shipping_addresses_full_address");
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
                    .replace("xa", ""),
                };
              });
              const findWard = newWards.find(
                (ward: any) => newValue.indexOf(ward.ward_name_normalize) > -1,
              );
              formRef.current?.setFieldsValue({
                shipping_addresses_ward_id: findWard ? findWard.id : null,
              });
            }
            setShippingWards(data);
          }),
        );
      }
    },
    [dispatch, formRef],
  );

  const checkAddress = useCallback(
    (type, value) => {
      const findArea = handleFindArea(value, newAreas);
      if (findArea) {
        switch (type) {
          case "full_address":
            if (formRef.current?.getFieldValue("district_id") !== findArea.id) {
              formRef.current?.setFieldsValue({
                district_id: findArea.id,
                ward_id: null,
              });
              getWards(findArea.id);
            }
            break;
          case "shipping_addresses_full_address":
            if (formRef.current?.getFieldValue("shipping_addresses_district_id") !== findArea.id) {
              formRef.current?.setFieldsValue({
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
    [formRef, getShippingWards, getWards, newAreas],
  );

  const createCustomerCallback = useCallback(
    (result: CustomerResponse) => {
      if (result !== null && result !== undefined) {
        showSuccess("Thêm mới khách hàng thành công");

        handleChangeCustomer({ ...result, version: 1 });
        setCustomerChange(false);
      }
    },
    [handleChangeCustomer, setCustomerChange],
  );

  const handleSubmit = useCallback(
    (values: any) => {
      let area = areas.find((area: any) => area.id === values.district_id);
      values.full_name = values.full_name.trim();

      let area_shipping_district = areas.find(
        (area: any) => area.id === values.shipping_addresses_district_id,
      );
      let area_shipping_ward = shippingWards.find(
        (ward: any) => ward.id === values.shipping_addresses_ward_id,
      );

      let customer_district = areas.find((area: any) => area.id === values.district_id);
      let customer_ward = wards.find((ward: any) => ward.id === values.ward_id);

      let shipping_addresses: CustomerShippingAddress[] | null =
        isVisibleShipping === false
          ? [
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
                district: area_shipping_district.name,
                ward_id: values.shipping_addresses_ward_id,
                ward: area_shipping_ward?.name || "",
                full_address: values.shipping_addresses_full_address,
              },
            ]
          : null;

      let piece: any = {
        full_name: values.full_name?.trim(),
        phone: values.phone?.trim(),
        city_id: area ? area.city_id : null,
        city: customer_district.city_name,
        district_id: values.district_id,
        district: customer_district.name,
        ward_id: values.ward_id,
        ward: customer_ward?.name,
        card_number: values.card_number,
        full_address: values.full_address,
        gender: values.gender,
        birthday: values.birthday ? new Date(values.birthday).toUTCString() : null,
        customer_group_id: values.customer_group_id,
        wedding_date: values.wedding_date ? new Date(values.wedding_date).toUTCString() : null,
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
      dispatch(CustomerCreateAction({ ...new CustomerModel(), ...piece }, createCustomerCallback));
    },
    [areas, shippingWards, wards, isVisibleShipping, dispatch, createCustomerCallback],
  );
  const onOkPress = useCallback(() => {
    customerForm.submit();
  }, [customerForm]);
  return (
    <StyleComponent>
      <Form
        form={customerForm}
        ref={formRef}
        name="customer_add"
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={initialFormValueCustomer}
        onValuesChange={() => setCustomerChange(true)}
      >
        <Row className="title-customer-info">THÔNG TIN KHÁCH HÀNG</Row>

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
                prefix={<UserOutlined className="icon-color" />}
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
              className="inputDistrictCreateCustomer"
            >
              <CustomSelect
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
                  getWards(value);
                  let values = formRef.current?.getFieldsValue();
                  values.ward_id = null;
                  formRef.current?.setFieldsValue(values);
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
            <Form.Item name="card_number">
              <Input
                placeholder="Nhập mã thẻ"
                prefix={<BarcodeOutlined className="icon-color" />}
              />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item name="full_address">
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
        </Row>

        <DividerCustom
          type={"extend"}
          isVisibleCollapse={isVisibleCollapseCustomer}
          setVisibleCollapse={setVisibleCollapseCustomer}
        />
        {isVisibleCollapseCustomer === true && (
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
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  format={"DD/MM/YYYY"}
                  // defaultPickerValue={moment("01/01/1991", "DD/MM/YYYY")}
                  suffixIcon={<CalendarOutlined className="date-icon" />}
                  onMouseLeave={() => {
                    const elm = document.getElementById("customer_add_birthday");
                    const newDate = elm?.getAttribute("value")
                      ? moment(elm?.getAttribute("value"), "DD/MM/YYYY")
                      : undefined;
                    if (newDate) {
                      formRef.current?.setFields([
                        {
                          name: "birthday",
                          value: newDate,
                          errors:
                            newDate > moment(new Date(), "DD/MM/YYYY")
                              ? ["Ngày sinh không được lớn hơn ngày hiện tại"]
                              : [],
                        },
                      ]);
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
        )}

        <DividerCustom
          type={"collapse"}
          isVisibleCollapse={isVisibleCollapseCustomer}
          setVisibleCollapse={setVisibleCollapseCustomer}
        />

        <Row gutter={12} style={{ marginTop: 15 }}>
          <Col md={12}>
            <Checkbox
              className="checkbox-style"
              onChange={() => {
                setVisibleShipping(!isVisibleShipping);
              }}
              checked={isVisibleShipping}
              //disabled={levelOrder > 3}
            >
              Thông tin của khách hàng cũng là thông tin giao hàng
            </Checkbox>
          </Col>
          {isVisibleShipping === true && (
            <ExecuteCustomer
              customerChange={customerChange}
              CustomerDeleteInfo={CustomerDeleteInfo}
              onOkPress={onOkPress}
            />
          )}
        </Row>

        {isVisibleShipping === false && (
          <React.Fragment>
            <Row className="title-customer-shipping">
              <div className="page-filter-left 33">THÔNG TIN GIAO HÀNG</div>
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
                    prefix={<UserOutlined className="icon-color" />}
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
                    prefix={<PhoneOutlined className="icon-color" />}
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
                        <EnvironmentOutlined className="icon-color" />
                        <span> Chọn khu vực</span>
                      </React.Fragment>
                    }
                    style={{ width: "100%" }}
                    onChange={(value: number) => {
                      let values = customerForm.getFieldsValue();
                      values.shipping_addresses_ward_id = null;
                      customerForm.setFieldsValue(values);
                      getShippingWards(value);
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
                        <EnvironmentOutlined className="icon-color" />
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
                    prefix={<EnvironmentOutlined className="icon-color" />}
                    onChange={(e) =>
                      checkAddress("shipping_addresses_full_address", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </React.Fragment>
        )}
      </Form>

      {isVisibleShipping === false && (
        <ExecuteCustomer
          customerChange={customerChange}
          CustomerDeleteInfo={CustomerDeleteInfo}
          onOkPress={onOkPress}
        />
      )}
    </StyleComponent>
  );
};

export default CreateCustomer;
