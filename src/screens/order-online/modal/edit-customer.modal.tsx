import {
  Form,
  Col,
  Input,
  Row,
  Select,
  DatePicker,
  Button,
  Divider,
  Popover,
  FormInstance,
} from "antd";
import { useDispatch } from "react-redux";
import React, { createRef, useCallback, useEffect } from "react";
import { CustomerResponse } from "model/response/customer/customer.response";
import { showSuccess } from "utils/ToastUtils";
import {
  CustomerContactClass,
  CustomerModel,
  CustomerShippingAddress,
} from "model/request/customer.request";
import {
  CustomerCreateAction,
  CustomerUpdateAction,
} from "domain/actions/customer/customer.action";
import * as CONSTANTS from "utils/Constants";
import moment from "moment";
import {
  BarcodeOutlined,
  CalendarOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ManOutlined,
  PhoneOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import CustomerShippingAddressOrder from "../component/order-detail/CardCustomer/customer-shipping";

type EditCustomerModalProps = {
  areas: any;
  wards: any;
  groups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  formItem: any;
  modalAction: string;
  isVisibleCollapseCustomer: boolean;
  districtId: number | null;
  onCancel: () => void;
  ShowAddressModalAdd: () => void;
  ShowAddressModalEdit: () => void;
  showAddressModalDelete: () => void;
  setSingleShippingAddress: (item: CustomerShippingAddress | null) => void;
  setVisibleCollapseCustomer: (item: boolean) => void;
  setVisibleBtnUpdate: (item: boolean) => void;
  ShippingAddressChange:(items: any) => void;
};

type FormValueType = {
  full_name?: string;
  phone?: string;
  birthday: any;
  district_id?: number;
  ward_id?: number;
  full_address?: string;
  email?: string;
  customer_group_id?: number;
  gender?: string;
  contact_note?: string;
  city_id?: number;
  card_number?: string;
};

const EditCustomerModal: React.FC<EditCustomerModalProps> = (
  props: EditCustomerModalProps
) => {
  const {
    areas,
    wards,
    groups,
    handleChangeArea,
    handleChangeCustomer,
    formItem,
    modalAction,
    districtId,
    isVisibleCollapseCustomer,
    ShowAddressModalAdd,
    ShowAddressModalEdit,
    showAddressModalDelete,
    setSingleShippingAddress,
    setVisibleCollapseCustomer,
    setVisibleBtnUpdate,
    ShippingAddressChange
    //onOk,
  } = props;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const formRef = createRef<FormInstance>();

  //element
  const fullNameElement: any = document.getElementById(
    "customer_add_full_name"
  );
  const phoneElement: any = document.getElementById("customer_add_phone");
  const cardNumberElement: any = document.getElementById(
    "customer_add_card_number"
  );
  const districtElement: any = document.getElementById(
    "customer_add_district_id"
  );
  const wardElement: any = document.getElementById("customer_add_ward_id_list");
  const fullAddressElement: any = document.getElementById(
    "customer_add_full_address"
  );
  const genreElement: any = document.getElementById("customer_add_gender");
  const birthdayElement: any = document.getElementById("customer_add_birthday");
  const groupElement: any = document.getElementById(
    "customer_add_customer_group_id"
  );

  //event
  fullNameElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  phoneElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  cardNumberElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  districtElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  wardElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  fullAddressElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  genreElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  birthdayElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });
  groupElement?.addEventListener("change", (e: any) => {
    setVisibleBtnUpdate(true);
  });

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          full_name: formItem?.full_name,
          phone: formItem?.phone,
          //   birthday: formItem?.birthday,
          birthday: formItem.birthday ? moment(formItem.birthday) : null,
          district_id: formItem?.district_id,
          ward_id: formItem?.ward_id,
          full_address: formItem?.full_address,
          email: formItem?.email,
          customer_group_id: formItem?.customer_group_id,
          gender: formItem?.gender,
          contact_note: formItem?.contact_note,
          city_id: formItem?.city_id,
          card_number: formItem?.card_number,
        }
      : {
          full_name: "",
          phone: "",
          birthday: null,
          district_id: undefined,
          ward_id: undefined,
          full_address: "",
          email: "",
          customer_group_id: undefined,
          gender: null,
          contact_note: "",
          city_id: undefined,
          card_number: "",
        };

  const onOkPress = useCallback(() => {
    customerForm.submit();
  }, [customerForm]);

  const createCustomerCallback = useCallback(
    (result: CustomerResponse) => {
      if (result !== null && result !== undefined) {
        //customerForm.resetFields();
        handleChangeCustomer(result);
        if(!isCreateForm)
          showSuccess("Cập nhập khách hàng thành công");
        else  showSuccess("Thêm mới khách hàng thành công");
      }
    },
    [handleChangeCustomer,isCreateForm]
  );

  const handleSubmit = useCallback(
    (values: any) => {
      let area = areas.find((area: any) => area.id === districtId);
      values.full_name = values.full_name.trim();

      if (!isCreateForm && formItem) {
        const processValue = {
          ...values,
          birthday: values.birthday
            ? new Date(values.birthday).toUTCString()
            : null,
          wedding_date: values.wedding_date
            ? new Date(values.wedding_date).toUTCString()
            : null,
          status: "active",
          city_id: area ? area.city_id : null,
          version: formItem.version,
          email: formItem.email,
          gender: formItem.gender,
          contact_note: formItem.contact_note,
          shipping_addresses: formItem.shipping_addresses.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          billing_addresses: formItem.billing_addresses.map((item: any) => {
            let _item = { ...item };
            _item.is_default = _item.default;
            return _item;
          }),
          contacts: formItem.contacts,
        };
        console.log(processValue);
        dispatch(
          CustomerUpdateAction(
            formItem.id,
            { ...new CustomerModel(), ...processValue },
            createCustomerCallback
          )
        );
      } else {
        let piece = {
          ...values,
          birthday: values.birthday
            ? new Date(values.birthday).toUTCString()
            : null,
          wedding_date: values.wedding_date
            ? new Date(values.wedding_date).toUTCString()
            : null,
          status: "active",
          city_id: area ? area.city_id : null,
          contacts: [
            {
              ...CustomerContactClass,
              name: values.contact_name,
              phone: values.contact_phone,
              note: values.contact_note,
              email: values.contact_email,
            },
          ],
        };
        dispatch(
          CustomerCreateAction(
            { ...new CustomerModel(), ...piece },
            createCustomerCallback
          )
        );
      }
    },
    [
      dispatch,
      createCustomerCallback,
      districtId,
      areas,
      isCreateForm,
      formItem,
    ]
  );

  useEffect(() => {
    if(formItem)
      customerForm.resetFields();
  }, [customerForm,formItem]);

  const DefaultWard = () => {
    let value = customerForm.getFieldsValue();
    value.ward_id = null;
    customerForm.setFieldsValue(value);
  };

  return (
    <Form
      form={customerForm}
      ref={formRef}
      name="customer_add"
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={initialFormValue}
    >
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
              prefix={<UserOutlined  style={{color:"#71767B"}}/>}
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
                  <EnvironmentOutlined style={{color:"#71767B"}}/>
                  <span> Chọn khu vực</span>
                </React.Fragment>
              }
              style={{ width: "100%" }}
              onChange={(value) => {
                handleChangeArea(value);
                DefaultWard();
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
                whitespace: true,
                message: "Vui lòng nhập Số điện thoại",
              },
            ]}
            name="phone"
            //label="Số điện thoại"
          >
            <Input
              placeholder="Nhập số điện thoại"
              prefix={<PhoneOutlined style={{color:"#71767B"}}/>}
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
                  <EnvironmentOutlined style={{color:"#71767B"}}/>
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
            style={formItem !== null?{marginBottom:"0px"}:{}}
          >
            <Input placeholder="Nhập mã thẻ" prefix={<BarcodeOutlined style={{color:"#71767B"}}/>} />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item
            name="full_address"
            style={formItem !== null?{marginBottom:"0px"}:{}}
          >
            <Input placeholder="Địa chỉ" prefix={<EnvironmentOutlined style={{color:"#71767B"}}/>} />
          </Form.Item>
        </Col>
      </Row>

      {formItem !== null && (
        <div>
          {isVisibleCollapseCustomer === false && (
            <Row style={{ margin: "0 0", color: "#5656A1" }}>
              <div
                className="page-filter-left"
                style={{ width: "15%"}}
              >
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
              <div className="page-filter-left" style={{ width: "55%", display: "flex", alignItems: "center" }}>
                <div className="ant-divider ant-divider-horizontal"></div>
              </div>
              <div
                className="page-filter-right"
                style={{ width: "30%" }}
              >
                <Popover
                  placement="left"
                  overlayStyle={{ zIndex: 17}}
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
                      customer={formItem}
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
                placement="left"
                overlayStyle={{ zIndex: 17}}
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
                    customer={formItem}
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
                  style={{paddingRight: 0}}
                >
                  Thay đổi địa chỉ giao hàng
                </Button>
              </Popover>
            </Divider>
          )}
        </div>
      )}

      {formItem === null && isVisibleCollapseCustomer === false && (
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
                      <ManOutlined style={{color:"#71767B"}} />
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
                  suffixIcon={<CalendarOutlined style={{color:"#71767B",float:"left"}}/>}
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
                      <TeamOutlined style={{color:"#71767B"}}/>
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

      <Button
        style={{ display: "none" }}
        id="btnUpdateCustomer"
        onClick={(e) => {
          e.stopPropagation();
          onOkPress();
        }}
      >
        Cập nhật
      </Button>
    </Form>
  );
};

export default EditCustomerModal;
