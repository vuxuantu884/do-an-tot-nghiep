import { ExclamationCircleOutlined, MinusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Row,
  Col,
  Select,
  Form,
  Input,
  Divider,
  FormInstance,
  Button,
  Checkbox,
  Modal
} from "antd";
import { WardResponse } from "model/content/ward.model";
import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import "./customer.scss";
import { useParams } from "react-router-dom";
import { CreateBillingAddress, CreateShippingAddress, DeleteBillingAddress, DeleteShippingAddress, UpdateBillingAddress, UpdateShippingAddress } from "domain/actions/customer/customer.action";
import { showSuccess } from "utils/ToastUtils";
interface AddressFormProps {
  countries: Array<CountryResponse>;
  field: any;
  remove: (index: number | number[]) => void;
  index: number;
  title: string;
  form?: FormInstance<any>;
  name: string;
  isEdit: boolean;
  reload?: () => void;
}

const { Option } = Select;

const { confirm } = Modal;

const AddressForm = ({
  countries,
  field,
  remove,
  index,
  title,
  form,
  name,
  isEdit,
  reload
}: AddressFormProps) => {
  const dispatch = useDispatch();
  const params: any = useParams();
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(getDistrictIdValue());
  const [countryId, setCountryId] = React.useState<number>(233);

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  React.useEffect(() => {
    if (districtId !== null) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  const setResultCreate = React.useCallback(result => {
    if (result) {
      showSuccess('Thêm mới địa chỉ thành công')
      if(reload) {reload()}
    }
  }, [reload])

  const setResultUpdate = React.useCallback(result => {
    if (result) {
      showSuccess('Cập nhật địa chỉ thành công')
      if(reload) {reload()}
    }
  }, [reload])

  const setResultDelete = React.useCallback(result => {
    if (result) {
      showSuccess('Xóa địa chỉ thành công')
      if(reload) {reload()}
    }
  }, [reload])

  // function getCityIdValue(): number | null {
  //   if (form) {
  //     const values: Array<any> = form?.getFieldValue(name);
  //     const value = values.find((_, index) => index === field.key);
  //     if (value) {
  //       return value.city_id;
  //     } else {
  //       return null;
  //     }
  //   }
  //   return null;
  // }

  function getDistrictIdValue(): number | null {
    if (form) {
      const values: Array<any> = form?.getFieldValue(name);
      const value = values.find((_, index) => index === field.key);
      if (value) {
        return value.district_id;
      } else {
        return null;
      }
    }
    return null;
  }

  const handleChangeCountry = (countryId: any) => {
    setCountryId(countryId);
  };

  // const handleChangeCity = (cityId: any) => {
  //   setCityId(cityId);
  // };

  const handleChangeArea = (districtId: any) => {
    if (districtId) {
      setDistrictId(districtId);
      let area = areas.find(area => area.id === districtId);
      let values: Array<any> = form?.getFieldValue(name);
      values.forEach((value, index) => {
        if(index === field.key) {
          value.city_id = area.city_id;
          value.city = area.city_name;
          value.district_id = districtId;
          value.district = area.name;
          value.ward_id = null;
          value.ward = '';
        }
      })

      form?.setFieldsValue({name: values})
    }
  };

  const handleChangeWard = (wardId: any) => {
    if (wardId) {
      let ward = wards.find(ward => ward.id === wardId);
      let values: Array<any> = form?.getFieldValue(name);
      values.forEach((value, index) => {
        if(index === field.key) {
          value.ward = ward?.name;
        }
      })

      form?.setFieldsValue({name: values})
    }
  };

  const handleSave = () => {
    const values: Array<any> = form?.getFieldValue(name);
    const value = values.find((_, index) => index === field.key);
    if (name.indexOf('bill') > -1) {
      if (value.id !== 0) {
        let address = {...value, is_default: value.default};
        delete address.default;
        dispatch(UpdateBillingAddress(value.id, params.id, address, setResultUpdate ))
      } else {
        dispatch(CreateBillingAddress(params.id, value, setResultCreate ))
      }
    } else {
      if (value.id !== 0) {
        let address = {...value, is_default: value.default};
        delete address.default;
        dispatch(UpdateShippingAddress(value.id, params.id, address, setResultUpdate ))
      } else {
        dispatch(CreateShippingAddress(params.id, value, setResultCreate ))
      }
    }
  }

  const handleRemove = (callback: any, field: any) => {
    const values: Array<any> = form?.getFieldValue(name);
    const value = values.find((_, index) => index === field.key);
    if (name.indexOf('bill') > -1) {
      if (value.id !== 0) {
        confirm({
          title: <h4>Bạn có chắc chắn xóa địa chỉ có người nhận <span style={{color: 'blue'}}>{value.name}</span> này không?</h4>,
          icon: <ExclamationCircleOutlined />,
          content: '',
          okText: 'Có',
          okType: 'danger',
          cancelText: 'Không',
          onOk() {
            dispatch(DeleteBillingAddress(value.id, params.id, setResultDelete ))
          },
          onCancel() {

          }
        })

      } else {
          callback(field.name)
      }
    } else {
      if (value.id !== 0) {
        confirm({
          title: <h4>Bạn có chắc chắn xóa địa chỉ có người nhận <span style={{color: 'blue'}}>{value.name}</span> này không?</h4>,
          icon: <ExclamationCircleOutlined />,
          content: '',
          okText: 'Có',
          okType: 'danger',
          cancelText: 'Không',
          onOk() {
            dispatch(DeleteShippingAddress(value.id, params.id, setResultDelete ))
          },
          onCancel() {

          }
        })
      } else {
        callback(field.name)
      }
    }
  }

  const handleChangeDefault = () => {
    let values: Array<any> = form?.getFieldValue(name);
    values.forEach((value, index) => {
      if(index !== field.key) {
        value.default = false;
        value.is_default = false;
      }
    })

    form?.setFieldsValue({name: values})
  }

  return (
    <Row gutter={12}>
      <Col span={24}>
        <Divider orientation="left">{title + ` ${index}`}</Divider>
      </Col>
      <Col span={23} style={{ padding: "0 1rem" }}>
        <Row gutter={8}>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Người nhận"
              name={[field.name, "name"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên người nhận",
                },
              ]}
            >
              <Input placeholder="Người nhận" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Số điện thoại"
              name={[field.name, "phone"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
              ]}
            >
              <Input placeholder="Số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Email"
              name={[field.name, "email"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thư điện tử",
                },
              ]}
            >
              <Input placeholder="Thư điện tử" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Quốc gia"
              name={[field.name, "country_id"]}
              initialValue={233}
            >
              <Select
                placeholder="Quốc gia"
                disabled
                onChange={handleChangeCountry}
                showSearch
                allowClear
                optionFilterProp="children"
              >
                {countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.name + ` - ${country.code}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Khu vực"
              name={[field.name, "district_id"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn khu vực",
                },
              ]}
            >
              <Select
              showSearch
               placeholder="Khu vực"
               onChange={handleChangeArea}
               allowClear
               optionFilterProp="children"
               >
                {areas.map((area) => (
                  <Option key={area.id} value={area.id}>
                    {area.city_name + ` - ${area.name}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col span={4}>
            <Form.Item
              {...field}
              label="Quận/huyện"
              name={[field.name, "district_id"]}
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
          </Col> */}
          <Col span={4}>
            <Form.Item
              {...field}
              label="Xã/phường"
              name={[field.name, "ward_id"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn xã/phường",
                },
              ]}
            >
              <Select
              showSearch
              allowClear
              optionFilterProp="children"
              placeholder="Xã/Phường"
              onChange={handleChangeWard}>
                {wards.map((ward) => (
                  <Option key={ward.id} value={ward.id}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Địa chỉ"
              name={[field.name, "full_address"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
            >
              <Input placeholder="Địa chỉ" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              {...field}
              label="Mã zip"
              name={[field.name, "zip_code"]}
            >
              <Input placeholder="Mã zip" />
            </Form.Item>
          </Col>
          {
            name.indexOf('bill') > -1 &&  <Col span={4}>
            <Form.Item
              {...field}
              label="Mã số thuế"
              name={[field.name, "tax_code"]}
            >
              <Input placeholder="Mã số thuế" />
            </Form.Item>
          </Col>
          }
          <Col span={2}>
            <Form.Item
              {...field}
              label="Mặc định"
              name={[field.name, "default"]}
              valuePropName="checked"
            >
              <Checkbox onChange={handleChangeDefault}></Checkbox>
            </Form.Item>
          </Col>
          {isEdit && (
            <Col span={1} style={{display: 'flex', flexDirection: 'column',justifyContent: 'center'}}>
              <Button title="Lưu" type="text" icon={<SaveOutlined/>} onClick={handleSave}>
              </Button>
            </Col>
          )}
        </Row>
      </Col>
      <Col span={1}>
        <MinusCircleOutlined onClick={() => handleRemove(remove, field)} />
      </Col>
    </Row>
  );
};

AddressForm.propTypes = {
  countries: PropTypes.array.isRequired,
  field: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

export default AddressForm;
