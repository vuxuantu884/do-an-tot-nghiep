import { MinusCircleOutlined } from "@ant-design/icons";
import { Row, Col, Select, Form, Input } from "antd";
import { DistrictResponse } from "model/content/district.model";
import { WardResponse } from "model/content/ward.model";
import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  CityByCountryAction,
  DistrictByCityAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import "./customer.scss";
interface AddressFormProps {
  countries: Array<CountryResponse>;
  field: any;
  remove: (index: number | number[]) => void;
  index: number;
}

const { Option } = Select;

const AddressForm = ({ countries, field, remove, index }: AddressFormProps) => {
  const dispatch = useDispatch();
  const [cities, setCities] = React.useState<Array<any>>([]);
  const [districts, setDistricts] = React.useState<Array<DistrictResponse>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [cityId, setCityId] = React.useState<any>(null);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [countryId, setCountryId] = React.useState<any>(null);

  React.useEffect(() => {
    if (countryId !== null) {
      dispatch(CityByCountryAction(countryId, setCities));
    }
  }, [countryId]);

  React.useEffect(() => {
    if (cityId !== null) {
      dispatch(DistrictByCityAction(cityId, setDistricts));
    }
  }, [cityId]);

  React.useEffect(() => {
    if (districtId !== null) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [districtId]);

  const handleChangeCountry = (countryId: any) => {
    setCountryId(countryId);
  };

  const handleChangeCity = (cityId: any) => {
    setCityId(cityId);
  };

  const handleChangeDistrict = (districtId: any) => {
    setDistrictId(districtId);
  };

  return (
    <Row gutter={12}>
      <Col span={24}>
        <h5>Địa chỉ giao hàng {index}</h5>
      </Col>
      <Col span={23}>
        <Row gutter={8}>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "country"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quốc gia",
                },
              ]}
            >
              <Select placeholder="Quốc gia" onChange={handleChangeCountry}>
                {countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.name + ` - ${country.code}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "city"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thành phố",
                },
              ]}
            >
              <Select placeholder="Tỉnh/thành phố" onChange={handleChangeCity}>
                {cities.map((city) => (
                  <Option key={city.id} value={city.id}>
                    {city.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "district"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quận/huyện",
                },
              ]}
            >
              <Select placeholder="Quận/huyện" onChange={handleChangeDistrict}>
                {districts.map((district) => (
                  <Option key={district.id} value={district.id}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              {...field}
              name={[field.name, "ward"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn xã/phường",
                },
              ]}
            >
              <Select placeholder="Xã/Phường">
                {wards.map((ward) => (
                  <Option key={ward.id} value={ward.id}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...field}
              name={[field.name, "address"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
            >
                <Input.TextArea placeholder="Địa chỉ" />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={1}>
        <MinusCircleOutlined onClick={() => remove(field.name)} />
      </Col>
    </Row>
  );
};

AddressForm.propTypes = {
  countries: PropTypes.array.isRequired,
  field: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired
};

export default AddressForm;
