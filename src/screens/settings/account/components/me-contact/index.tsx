import {Col, Form, Input, Row, Select} from "antd";
import {DistrictGetByCountryAction} from "domain/actions/content/content.action";
import {CityView, DistrictResponse} from "model/content/district.model";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {convertDistrict} from "utils/AppUtils";
import {RegUtil} from "utils/RegUtils";
const {Option, OptGroup} = Select;

type FormValuesType = {
  phone: string,
  district: string| null| undefined,
  country: string| null| undefined,
  country_id: number| null| undefined,
  city: string| null| undefined,
  city_id: number| null| undefined,
  district_id: number | null | undefined,
  address: string | null | undefined,
  version: number | null;
};

const defaultCountry = 233;

const MeContact: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const {formItem, form} = props;

  const initialFormValues: FormValuesType = {
    phone: formItem?.phone,
    country: formItem?.country,
    country_id: formItem?.country_id,
    city: formItem?.city,
    city_id: formItem?.city,
    district: formItem?.district,
    district_id: formItem?.district_id,
    address: formItem?.address,
    version: formItem?.version
  }

  const dispatch = useDispatch();
  const [cityViews, setCityView] = useState<Array<CityView>>([]);

  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);

  const onSelectDistrict = useCallback(
    (value: number) => {
      let cityId = -1, district="", city=null, country=null, countryId=-1;
      cityViews.forEach((item) => {
        item.districts.forEach((item1) => {
          if (item1.id === value) {
            cityId = item.city_id;
            district = item1.name;
          }
        });
      });
      if (cityId !== -1) {
        form?.setFieldsValue({
          city_id: cityId,
          city: city,
          country: country,
          country_id: countryId,
          district: district,
        });
      }
    },
    [cityViews, form]
  );

  useEffect(() => {
    form.resetFields();

    dispatch(DistrictGetByCountryAction(defaultCountry, setDataDistrict));
  }, [form, formItem, setDataDistrict, dispatch]);

  return (
    <Form
      form={form}
      name="control-hooks"
      layout="vertical"
      initialValues={initialFormValues}
    >
      <Row gutter={30}>
        <Col span={24}>
          <Form.Item hidden noStyle label="Account" name="version">
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {required: true, message: "Vui lòng nhập số điện thoại."},
              {
                pattern: RegUtil.PHONE,
                message: "Số điện thoại không đúng định dạng",
              },
            ]}
          >
            <Input className="r-5" placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="district" hidden={true}></Form.Item>
          <Form.Item name="country_id" hidden={true}></Form.Item>
          <Form.Item name="country" hidden={true}></Form.Item>
          <Form.Item name="city" hidden={true}></Form.Item>
          <Form.Item name="city_id" hidden={true}></Form.Item>
          <Form.Item label="Khu vực" name="district_id">
            <Select
              allowClear
              showArrow
              showSearch
              onSelect={onSelectDistrict}
              placeholder="Chọn khu vực"
            >
              {cityViews?.map((item) => (
                <OptGroup key={item.city_id} label={item.city_name}>
                  {item.districts.map((item1) => (
                    <Option key={item1.id} value={item1.id}>
                      {item1.name}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input className="r-5" placeholder="Nhập địa chỉ" size="large" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default MeContact;
