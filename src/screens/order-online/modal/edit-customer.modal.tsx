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
} from "antd";
import { useDispatch } from "react-redux";
import React, { useCallback, useEffect } from "react";
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
  IdcardOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";

import CustomerShippingAddressOrder from "../component/order-detail/CardCustomer/customer-shipping";
import { ShippingAddress } from "model/response/order/order.response";


type EditCustomerModalProps = {
  areas: any;
  wards: any;
  groups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  setShippingAddress:any;
  formItem: any;
  modalAction: string;
  isVisibleCollapseCustomer: boolean;
  districtId: number | null;
  titleNotify:string;
  onCancel: () => void;
  ShowAddressModalAdd:()=>void;
  ShowAddressModalEdit:()=>void;
  showAddressModalDelete:()=>void;
  setSingleShippingAddress:(item:CustomerShippingAddress | null)=>void;
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
    setShippingAddress,
    formItem,
    modalAction,
    districtId,
    titleNotify,
    isVisibleCollapseCustomer,
    onCancel,
    ShowAddressModalAdd,
    ShowAddressModalEdit,
    showAddressModalDelete,
    setSingleShippingAddress,
    //onOk,
  } = props;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();

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
          gender: "",
          contact_note: "",
          city_id: undefined,
          card_number: "",
        };

  const onOkPress = useCallback(() => {
    customerForm.submit();
  }, [customerForm]);

  const handleCancel = () => {
    customerForm.resetFields();
    onCancel();
  };

  const createCustomerCallback = useCallback(
    (result: CustomerResponse) => {
      if (result !== null && result !== undefined) {
        //customerForm.resetFields();
        handleChangeCustomer(result);
        showSuccess(titleNotify);
      }
    },
    [handleChangeCustomer, titleNotify]
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
          gender:formItem.gender,
          contact_note:formItem.contact_note,
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
    customerForm.resetFields();
  }, [customerForm]);

  const DefaultWard = () => {
    let value = customerForm.getFieldsValue();
    value.ward_id = null;
    customerForm.setFieldsValue(value);
  };

  return (
    <Form
      form={customerForm}
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
          >
            <Input
              placeholder="Nhập Tên khách hàng"
              prefix={<UserOutlined />}
              //suffix={<img src={arrowDownIcon} alt="down" />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
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
              placeholder="Chọn khu vực"
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
          >
            <Input
              placeholder="Nhập số điện thoại"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item
            name="ward_id"
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
              placeholder="Chọn phường/xã"
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
          <Form.Item name="card_number" >
            <Input placeholder="Nhập mã thẻ" prefix={<BarcodeOutlined />} />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item name="full_address" >
            <Input placeholder="Địa chỉ" prefix={<IdcardOutlined />} />
          </Form.Item>
        </Col>
       
      </Row>

      {isVisibleCollapseCustomer===false &&(
      <Row gutter={24}>
        <Col
          md={24}
          style={{ marginLeft: "-10px", marginTop: "3px", padding: "3px" }}
        >
          <Button
            type="primary"
            style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
            className="create-button-custom ant-btn-outline fixed-button"
            onClick={onOkPress}
          >
            Cập nhật
          </Button>
        </Col>
        </Row>
     )}
      {formItem!==null &&(
      <Divider orientation="right" >
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
                         <Button type="link" icon={<PlusOutlined />} onClick={ShowAddressModalAdd}>
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
                         handleSingleShippingAddress={
                           setSingleShippingAddress
                         }
                         handleShippingAddress={setShippingAddress}
                       />
                     }
                     trigger="click"
                     className="change-shipping-address"
                   >
                     <Button type="link"icon={<PlusOutlined />} className="btn-style">
                       Thay đổi địa chỉ giao hàng
                     </Button>
                   </Popover>
      </Divider>
      )}
     {isVisibleCollapseCustomer===true &&(
       <div>
        <Row gutter={24}>

        <Col xs={24} lg={12}>
          <Form.Item name="gender">
            <Select
              showSearch
              allowClear
              optionFilterProp="children"
              placeholder="Giới tính"
              className="select-with-search"
            >
                  <Select.Option key={1} value={"male"}>Nam</Select.Option>
                  <Select.Option key={2} value={"female"}>Nữ</Select.Option>
                  <Select.Option key={3} value={"other"}>Không xác định</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item
            name="birthday"
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
              suffixIcon={<CalendarOutlined />}
            />
          </Form.Item>
        </Col>

        <Col xs={24} lg={12}>
          <Form.Item name="customer_group_id">
            <Select
              showSearch
              allowClear
              optionFilterProp="children"
              placeholder="Nhóm"
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
        {isVisibleCollapseCustomer===true&&(
          <Col xs={24} lg={12} style={{paddingTop:"30px", paddingRight:"12px"}}>
        <Button
            type="primary"
            style={{ padding: "0 25px", fontWeight: 400, float: "right" }}
            className="create-button-custom ant-btn-outline fixed-button"
            onClick={onOkPress}
          >
            Cập nhật
          </Button>
        </Col>

        )}
        
        </Row>
        
       </div>
     )}
   
     
      
    </Form>
  );
};

export default EditCustomerModal;
