import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";
import { WardResponse } from "model/content/ward.model";
import { CountryResponse } from "model/content/country.model";
import { useDispatch } from "react-redux";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { RegUtil } from "utils/RegUtils";
import CustomInput from "screens/customer/customInput";

const { Option } = Select;

type FormValueType = {
  name: string;
  phone: string;
  country_id: number;
  district_id: number;
  ward_id: number;
  full_address: string;
  is_default: boolean;
  email: string;
  city_id: number;
  tax_code: string;
  default: boolean;
};

const FormCustomerBillingAddress: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const dispatch = useDispatch();
  const { modalAction, formItem, form, visible } = props;

  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [countryId, setCountryId] = React.useState<number>(233);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  // const DEFAULT_FORM_VALUE = {
  //   company_id: 1,
  //   company: "YODY",
  // };
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          name: formItem?.name,
          phone: formItem?.phone,
          district_id: formItem.district_id,
          country_id: formItem.country_id,
          ward_id: formItem?.ward_id,
          full_address: formItem?.full_address,
          is_default: formItem?.default,
          email: formItem?.email,
          city_id: formItem?.city_id,
          tax_code: formItem?.tax_code,
          default: formItem?.default,
        }
      : {
          name: "",
          phone: "",
          country_id: 233,
          district_id: null,
          ward_id: null,
          full_address: "",
          is_default: false,
          email: "",
          city_id: null,
          tax_code: "",
          default: null,
        };
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  // const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  const handleChangeDefault = (value: any) => {
    console.log(value.target.checked);
  };

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
  React.useEffect(() => {
    if (formItem) {
      setDistrictId(formItem.district_id);
    }
  }, [formItem]);

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

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

  return (
    <StyledComponent>
      <Form
        form={form}
        name="form-order-processing-status"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Row gutter={20}>
          <Col span={24}>
            {/* <Form.Item
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
            </Form.Item> */}
             <CustomInput
                name="name"
                label="Họ tên người nhận:"
                form={form}
                message="Vui lòng nhập họ tên người nhận"
                placeholder="Nhập họ tên người nhận"
                isRequired={true}
                maxLength={255}
              />
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label={<b>Số điện thoại:</b>}
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
                    placeholder="Nhập số điện thoại"
                    style={{ width: "100%" }}
                    minLength={9}
                    maxLength={15}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label={<b>Email:</b>}
                  rules={[
                    {
                      pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                      message: "Vui lòng nhập đúng định dạng email",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập email"
                    style={{ width: "100%" }}
                    maxLength={255}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
              <Form.Item
                    label={<b>Mã số thuế:</b>}
                    name="tax_code"
                    rules={[
                      {
                        pattern: RegUtil.NUMBERREG,
                        message: "Mã số thuế chỉ được phép nhập số",
                      },
                    ]}
                  >
                    <Input maxLength={255} placeholder="Mã số thuế" />
                  </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<b>Quốc gia:</b>}
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
                      <Option key={country.id} value={country.id}>
                        {country.name + ` - ${country.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  label={<b>Khu vực:</b>}
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
                      <Option key={area.id} value={area.id}>
                        {area.city_name + ` - ${area.name}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<b>Thành phố:</b>} name="city_id" hidden>
                  <Input
                    placeholder="Nhập địa chỉ chi tiết"
                    style={{ width: "100%" }}
                    maxLength={255}
                  />
                </Form.Item>
                <Form.Item
                  label={<b>Phường/xã:</b>}
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
                      <Option key={ward.id} value={ward.id}>
                        {ward.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {/* <Form.Item
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
                placeholder="Nhập địa chỉ chi tiết"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item> */}
            <CustomInput
                name="full_address"
                label="Địa chỉ chi tiết:"
                form={form}
                message="Vui lòng nhập địa chỉ chi tiết"
                placeholder="Nhập địa chỉ chi tiết"
                isRequired={true}
                maxLength={255}
              />
            <Form.Item name="default" hidden></Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormCustomerBillingAddress;
