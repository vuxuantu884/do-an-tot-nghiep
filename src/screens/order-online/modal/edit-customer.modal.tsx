import {
  Form,
  Col,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  DatePicker,
} from "antd";
import { useDispatch } from "react-redux";
import React, { useCallback, useEffect, useState } from "react";
import { CustomerResponse } from "model/response/customer/customer.response";
import { showSuccess } from "utils/ToastUtils";
import {
  CustomerContactClass,
  CustomerModel,
} from "model/request/customer.request";
import {
  CustomerCreateAction,
  CustomerUpdateAction,
} from "domain/actions/customer/customer.action";
import * as CONSTANTS from "utils/Constants";
import moment from "moment";
import { Button } from "antd/lib/radio";
import plusBlueIcon from "assets/img/plus-blue.svg";
import arrowDownIcon from "assets/img/drow-down.svg";

type EditCustomerModalProps = {
  areas: any;
  wards: any;
  groups: any;
  handleChangeArea: any;
  handleChangeCustomer: any;
  formItem: any;
  modalAction: string;
  visible: boolean;
  districtId: number | null;
  onCancel: () => void;
  //onOk: () => void;
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
    visible,
    districtId,
    onCancel,
    //onOk,
  } = props;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const [titleForm, setTitleForm] = useState("Thêm thông tin khách hàng");
  const [titleNotify, setTitleNotify] = useState("Thêm mới dữ liệu thành công");

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
        customerForm.resetFields();
        handleChangeCustomer(result);
        showSuccess(titleNotify);
        onCancel();
      }
    },
    [customerForm, onCancel, handleChangeCustomer, titleNotify]
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
    if (!isCreateForm && formItem) {
      setTitleForm("Cập nhập thông tin khách hàng");
      setTitleNotify("Cập nhập dữ liệu thành công");
    } else {
      setTitleForm("Thêm thông tin khách hàng");
      setTitleNotify("Thêm mới dữ liệu thành công");
    }
  }, [customerForm, visible, isCreateForm, formItem]);

  const DefaultWard = () => {
    let value = customerForm.getFieldsValue();
    value.ward_id = null;
    customerForm.setFieldsValue(value);
  };

  return (
    <Modal
      title={titleForm}
      visible={visible}
      centered
      okText="Lưu"
      cancelText="Hủy"
      width={700}
      onOk={onOkPress}
      onCancel={handleCancel}
    >
      <Form
        form={customerForm}
        name="customer_add"
        onFinish={handleSubmit}
        // onFinishFailed={handleSubmitFail}
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
              label="Tên khách hàng"
            >
              <Input
                placeholder="Nhập Tên khách hàng"
                //suffix={<img src={arrowDownIcon} alt="down" />}
              />
            </Form.Item>
          </Col>

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
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item name="tax_code" label="Mã thẻ">
              <Input placeholder="Nhập mã thẻ" />
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item
              name="birthday"
              label="Ngày sinh"
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
              />
              {/* <Input placeholder="Nhập Ngày sinh" /> */}
            </Form.Item>
          </Col>

          <Col xs={24} lg={12}>
            <Form.Item name="district_id" label="Khu vực">
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
            <Form.Item name="ward_id" label="Phường xã">
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
            <Form.Item name="full_address" label="Địa chỉ">
              <Input placeholder="Địa chỉ" />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item
              name="email"
              label="Email"
              className="form-group form-group-with-search"
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>

          {/* <Col xs={24} lg={12}>
            <div className="form-group form-group-with-search">
              <label htmlFor="" className="">
                Nguồn
              </label>
              <div>
                <Input.Search
                  placeholder="Chọn nguồn"
                  enterButton={
                    <Button type="text">
                      <img src={plusBlueIcon} alt="" />
                    </Button>
                  }
                  suffix={<img src={arrowDownIcon} alt="down" />}
                />
              </div>
            </div>
          </Col> */}
          <Col xs={24} lg={12}>
            <Form.Item name="customer_group_id" label="Nhóm">
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

          <Col xs={24} lg={12}>
            <Form.Item name="gender" label="Giới tính">
              <Radio.Group value={"1"}>
                <Space>
                  <Radio value={"male"}>Nam</Radio>
                  <Radio value={"female"}>Nữ</Radio>
                  <Radio value={"other"}>Không xác định</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <Form.Item name="contact_note" label="Ghi chú">
              <Input placeholder="Điền ghi chú" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditCustomerModal;
