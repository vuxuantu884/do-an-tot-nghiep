import { Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import React from "react";
import * as CONSTANTS from "utils/Constants";
import { WardResponse } from "model/content/ward.model";
import { CountryResponse } from "model/content/country.model";
import { useDispatch } from "react-redux";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { RegUtil } from "utils/RegUtils";
import CustomInput from "screens/customer/common/customInput";

const { Option } = Select;

type FormValueType = {
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

const FormCustomerShippingAddress: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const dispatch = useDispatch();
  const { modalAction, formItem, form, visible } = props;

  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [countryId] = React.useState<number>(233);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  // const DEFAULT_COMPANY = {
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
          city_id: formItem?.city_id,
          default: formItem?.default,
        }
      : {
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

  // const LIST_STATUS = bootstrapReducer.data?.order_main_status;

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
              rules={[{ required: true, message: "Vui lòng nhập họ tên người nhận" }]}
            >
              <Input
                placeholder="Nhập họ tên người nhận"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item> */}
          <CustomInput
            name="name"
            label={<span className="fw-500">Họ tên người nhận:</span>}
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
                  placeholder="Nhập số điện thoại"
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
                    <Option key={area.id} value={area.id}>
                      {area.city_name + ` - ${area.name}`}
                    </Option>
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
            label={<span className="fw-500">Địa chỉ chi tiết:</span>}
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
  );
};

export default FormCustomerShippingAddress;
