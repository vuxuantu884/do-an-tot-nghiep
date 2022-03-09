import { Col, Form, Input, Modal, Row, Select } from "antd";
//import arrowDownIcon from "assets/img/drow-down.svg";
import { CountryGetAllAction, WardGetByDistrictAction } from "domain/actions/content/content.action";
import { CreateShippingAddress, getCustomerDetailAction, UpdateShippingAddress } from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import { modalActionType } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { CustomerShippingAddress } from "model/request/customer.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { ShippingAddress } from "model/response/order/order.response";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleCalculateShippingFeeApplyOrderSetting, totalAmount } from "utils/AppUtils";
import * as CONSTANTS from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { showError, showSuccess } from "utils/ToastUtils";

type AddAddressModalProps = {
  customer: CustomerResponse | null;
  handleChangeCustomer: any;
  formItem: any;
  visible: boolean;
	areas: any[];
  modalAction: modalActionType;
  onCancel: () => void;
  onOk: () => void;
  setShippingFeeInformedToCustomer: ((value: number | null) => void) | undefined
};

type FormValueType = {
  id: number;
  name: string;
  phone: string;
  country_id: number;
  district_id: number;
  ward_id: number;
  full_address: string;
  is_default: boolean;
  city_id: number;
  default: boolean;
};

const AddAddressModal: React.FC<AddAddressModalProps> = (
  props: AddAddressModalProps
) => {
  const {
		areas,
    visible,
    onCancel,
    formItem,
    modalAction,
    customer,
    handleChangeCustomer,
    setShippingFeeInformedToCustomer,
  } = props;

  const orderLineItems = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.orderLineItems);

  const shippingServiceConfig = useSelector((state: RootReducerType) => state.orderReducer.shippingServiceConfig);

  const transportService = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);

  const onOkPress = useCallback(() => {
    form.submit();
  }, [form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;

  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          id: formItem?.id,
          name: formItem?.name,
          phone: formItem?.phone,
          district_id: formItem.district_id,
          country_id: formItem.country_id,
          ward_id: formItem?.ward_id,
          full_address: formItem?.full_address,
          is_default: formItem?.default,
          city_id: formItem?.city_id,
          default: formItem?.default,
        }
      : {
          id: null,
          name: "",
          phone: "",
          country_id: 233,
          district_id: null,
          city_id: null,
          ward_id: null,
          full_address: "",
          is_default: false,
          default: null,
        };

  React.useEffect(() => {
    if (formItem) {
      setDistrictId(formItem.district_id);
    }
  }, [formItem]);

  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  React.useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
  }, [dispatch]);

  React.useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
      let area = areas.find((area) => area.id === districtId);
      let value = form?.getFieldsValue();
      value.city_id = area.city_id;
      value.city = area.city_name;
      value.district_id = districtId;
      value.district = area.name;
      value.ward_id = null;
      value.ward = "";
      form?.setFieldsValue(value);
    }
  };

  const handleSubmit = useCallback(
    (value: CustomerShippingAddress) => {
      if (!isCreateForm) {
        if (customer && formItem) {
          value.is_default = value.default;
          dispatch(
            UpdateShippingAddress(
              value.id,
              customer.id,
              value,
              (data: ShippingAddress) => {
                if (data) {
                  dispatch(
                    getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                      handleChangeCustomer(datas);
                      const orderAmount = totalAmount(orderLineItems);
                      if(value.default) {
                        handleCalculateShippingFeeApplyOrderSetting(data?.city_id, orderAmount, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer)
                      }
                    })
                  );
                  onCancel();
                  showSuccess("Cập nhật địa chỉ thành công");
                } else {
                  showError("Cập nhật địa chỉ thất bại");
                }
              }
            )
          );
        }
      } else {
        if (customer) {
          value.is_default = false;
          dispatch(
            CreateShippingAddress(
              customer.id,
              value,
              (data: CustomerShippingAddress) => {
                if (data) {
                  dispatch(
                    getCustomerDetailAction(customer.id, (datas: CustomerResponse) => {
                      handleChangeCustomer(datas);
                    })
                  );
                  onCancel();
                  showSuccess("Thêm địa chỉ thành công");
                } else {
                  showError("Thêm địa chỉ thất bại");
                }
              }
            )
          );
        }
      }
    },
    [isCreateForm, customer, formItem, dispatch, onCancel, handleChangeCustomer, orderLineItems, shippingServiceConfig, transportService, form, setShippingFeeInformedToCustomer]
  );

  return (
    <Modal
      title="Thêm địa chỉ giao hàng"
      visible={visible}
      centered
      okText="Lưu"
      cancelText="Hủy"
      className="update-shipping"
      onOk={onOkPress}
      onCancel={handleCancel}
      width={"700px"}
    >
      <Form
        form={form}
        initialValues={initialFormValue}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={<b>Họ tên người nhận:</b>}
              rules={[
                { required: true, message: "Vui lòng nhập họ tên người nhận" },
              ]}
            >
              <Input
                placeholder="Nhập họ tên người nhận"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label={<span className="fw-500">Số điện thoại:</span>}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại",
                    },
                    {
                      pattern: RegUtil.PHONE,
                      message: "Số điện thoại chưa đúng định dạng",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại người nhận"
                    style={{ width: "100%" }}
                    minLength={9}
                    maxLength={15}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="fw-500">Quốc gia:</span>}
                  name="country_id"
                  initialValue={233}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn quốc gia",
                    },
                  ]}
                >
                  <Select
                    placeholder="Quốc gia"
                    disabled
                    // onChange={handleChangeCountry}
                    showSearch
                    allowClear
                    optionFilterProp="children"
                  >
                    {countries.map((country: any) => (
                      <Select.Option key={country.id} value={country.id}>
                        {country.name + ` - ${country.code}`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={<span className="fw-500">Khu vực:</span>}
                  name="district_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn khu vực",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Chọn khu vực"
                    onChange={handleChangeArea}
                    allowClear
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
                  label={<span className="fw-500">Thành phố:</span>}
                  name="city_id"
                  hidden
                >
                  <Input
                    placeholder="Nhập địa chỉ chi tiết"
                    style={{ width: "100%" }}
                    maxLength={255}
                  />
                </Form.Item>
                <Form.Item
                  label={<span className="fw-500">Phường/xã:</span>}
                  name="ward_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn phường/xã",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    placeholder="Chọn phường/xã"
                    // onChange={handleChangeWard}
                  >
                    {wards.map((ward: any) => (
                      <Select.Option key={ward.id} value={ward.id}>
                        {ward.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="full_address"
              label={<b>Địa chỉ chi tiết:</b>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ chi tiết",
                },
              ]}
            >
              <Input
                placeholder="Nhập địa chỉ chi tiết VD: 90 Nguyễn Tuân"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item>
            <Form.Item name="default" hidden></Form.Item>
            <Form.Item name="id" hidden></Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddAddressModal;
