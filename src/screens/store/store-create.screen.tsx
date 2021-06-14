import { Button, Card, Col, Collapse, Form, FormInstance, Input, Row, Select } from "antd";
import { CountryGetAllAction, DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { StoreCreateAction } from "domain/actions/core/store.action";
import { StoreCreateRequest } from "model/core/store.model";
import { CityView } from "model/content/district.model";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import moment from "moment";
import { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { convertDistrict } from "utils/AppUtils";

const { Item } = Form;
const { Panel } = Collapse;
const { OptGroup, Option } = Select
const DefaultCountry = 233;
const initRequest: StoreCreateRequest = {
  name: '',
  hotline: '',
  country_id: DefaultCountry,
  city_id: null,
  district_id: null,
  ward_id: null,
  address: '',
  zip_code: null,
  email: null,
  square: null,
  rank: null,
  status: '',
  begin_date: moment(),
  latitude: null,
  longtitude: null,
  group_id: null,
}

const StoreCreateScreen: React.FC = () => {
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //State
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const formRef = createRef<FormInstance>()
  //EndState
  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);
  const onSelectDistrict = useCallback((value: number) => {
    let cityId = -1;
    cityViews.forEach((item) => {
      item.districts.forEach((item1) => {
        if (item1.id === value) {
          cityId = item.city_id
        }
      })
    })
    if (cityId !== -1) {
      formRef.current?.setFieldsValue({
        city_id: cityId
      })
    }
  }, [cityViews, formRef])
  const onCreateSuccess = useCallback(() => {
    history.push('/suppliers');
  }, [history])
  const onFinish = useCallback((values: StoreCreateRequest) => {
    dispatch(StoreCreateAction(values, onCreateSuccess))
  }, [dispatch, onCreateSuccess])
  useEffect(() => {
    dispatch(CountryGetAllAction(setCountries))
    dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict))
  }, [dispatch, setDataDistrict])
  return (
    <Form ref={formRef} layout="vertical" onFinish={onFinish} initialValues={initRequest}>
      <Card
        className="card-block card-block-normal"
        title="Thông tin cơ bản"
        extra={
          <div className="v-extra d-flex align-items-center">

          </div>
        }
      >
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
              className="form-group form-group-with-search"
              label="Tên cửa hàng"
              name="name"
            >
              <Input className="r-5" placeholder="Nhập tên cửa hàng" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              className="form-group form-group-with-search"
              name="hotline"
              label="Số điện thoại"
            >
              <Input className="r-5" placeholder="Nhập số điện thoại" size="large" />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{required: true}]}
              className="form-group form-group-with-search"
              label="Quốc gia"
              name="country_id"
            >
              <Select disabled className="selector" placeholder="Chọn ngành hàng">
                {
                  countries?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                }
              </Select>
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{required: true, message: 'Vui lòng chọn khu vực'}]}
              className="form-group form-group-with-search"
              label="Khu vực"
              name="district_id"
            >
              <Select
                showSearch
                onSelect={onSelectDistrict}
                className="selector"
                placeholder="Chọn khu vực"
              >
                {
                  cityViews?.map((item) => (
                    <OptGroup key={item.city_id} label={item.city_name}>
                      {
                        item.districts.map((item1) => (
                          <Option key={item1.id} value={item1.id}>{item1.name}</Option>
                        ))
                      }
                    </OptGroup>
                  ))
                }
              </Select>
            </Item>
            <Item
              hidden
              className="form-group form-group-with-search"
              name="city_id"
            >
              <Input />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              rules={[
                { required: true, message: 'Vui lòng chọn ngành hàng' },
              ]}
              name="goods"
              label="Ngành hàng"
            >
              <Select mode="multiple" className="selector" placeholder="Chọn ngành hàng">

              </Select>
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng chọ nhân viên phụ trách' }]}
              className="form-group form-group-with-search"
              name="person_in_charge"
              label="Nhân viên phụ trách"
            >
              <Select placeholder="Chọn nhân viên phụ trách" className="selector">

              </Select>
            </Item>
          </Col>
        </Row>
        <Row className="title-rule">
          <div className="title">Thông tin khác</div>
          <div className="rule" />
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Quốc gia"
              name="country_id"
            >
              <Select disabled className="selector" placeholder="Chọn ngành hàng">
                {
                  countries?.map((item) => (<Option key={item.id} value={item.id}>{item.name}</Option>))
                }
              </Select>
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng nhập người liên hệ' }]}
              className="form-group form-group-with-search"
              name="contact_name"
              label="Người liên hệ"
            >
              <Input className="r-5" placeholder="Nhập người liên hệ" size="large" />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Khu vực"
              name="district_id"
            >
              <Select
                showSearch
                onSelect={onSelectDistrict}
                className="selector"
                placeholder="Chọn khu vực"
              >
                {
                  cityViews?.map((item) => (
                    <OptGroup key={item.city_id} label={item.city_name}>
                      {
                        item.districts.map((item1) => (
                          <Option key={item1.id} value={item1.id}>{item1.name}</Option>
                        ))
                      }
                    </OptGroup>
                  ))
                }
              </Select>
            </Item>
            <Item
              hidden
              className="form-group form-group-with-search"
              name="city_id"
            >
              <Input />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              className="form-group form-group-with-search"
              name="phone"
              label="Số điện thoại"
            >
              <Input className="r-5" placeholder="Nhập số điện thoại" size="large" />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Địa chỉ"
              name="address"
            >
              <Input className="r-5" placeholder="Nhập địa chỉ" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              name="email"
              label="Nhập email"
            >
              <Input className="r-5" placeholder="Nhập email" size="large" />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Website"
              name="website"
            >
              <Input className="r-5" placeholder="Nhập website" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              name="tax_code"
              label="Mã số thuế"
            >
              <Input className="r-5" placeholder="Nhập mã số thuế" size="large" />
            </Item>
          </Col>
        </Row>
      </Card>
      <Collapse expandIconPosition="right" className="view-other card-block card-block-normal">
        <Panel header="Thông tin thanh toán" key="1">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                label="Ngân hàng"
                name="bank_name"
              >
                <Input className="r-5" placeholder="Nhập ngân hàng" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                name="bank_brand"
                label="Chi nhánh"
              >
                <Input className="r-5" placeholder="Nhập chi nhánh" size="large" />
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                label="Số tài khoản"
                name="bank_number"
              >
                <Input className="r-5" placeholder="Nhập số tài khoản" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                name="beneficiary_name"
                label="Chủ tài khoản"
              >
                <Input className="r-5" placeholder="Nhập chủ tài khoản" size="large" />
              </Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>
      <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button htmlType="submit" type="default" className="btn-style btn-save">Lưu</Button>
      </Row>
    </Form>
  )
}

export default StoreCreateScreen;