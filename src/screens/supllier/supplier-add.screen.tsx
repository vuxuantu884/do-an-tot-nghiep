import { Button, Card, Col, Collapse, Form, FormInstance, Input, Radio, Row, Select, Switch } from "antd";
import AccountAction from "domain/actions/account/account.action";
import { getCountry, getDistrictAction } from "domain/actions/content/content.action";
import SupplierAction from "domain/actions/core/supplier.action";
import { CityView } from "model/other/district-view";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SupplierCreateRequest } from "model/request/create-supplier.request";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { PageResponse } from "model/response/base-metadata.response";
import { CountryResponse } from "model/response/content/country.response";
import { DistrictResponse } from "model/response/content/district.response";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { convertDistrict } from "utils/AppUtils";

const { Item } = Form;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

const DefaultCountry = 233;
const initRequest: SupplierCreateRequest = {
  address: '',
  bank_brand: '',
  bank_name: '',
  bank_number: '',
  beneficiary_name: '',
  certifications: [],
  city_id: null,
  country_id: DefaultCountry,
  contact_name: '',
  debt_time: null,
  debt_time_unit: null,
  district_id: null,
  website: null,
  email: '',
  fax: '',
  goods: [],
  person_in_charge: null,
  moq: null,
  note: '',
  name: '',
  phone: '',
  scorecard: null,
  status: 'active',
  tax_code: '',
  type: '',
};
const CreateSupplierScreen: React.FC = () => {
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>()
  const history = useHistory();
  const supplier_type = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_type);
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);
  const scorecards = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.scorecard);
  const date_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.date_unit);
  const moq_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.moq_unit);
  const supplier_status = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_status);
  //State
  const [accounts, setAccounts] = useState<Array<AccountDetailResponse>>([]);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  //EndState
  //Callback
  const setDataAccounts = useCallback((data: PageResponse<AccountDetailResponse>) => {
    setAccounts(data.items);
  }, []);
  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);
  const onChangeStatus = useCallback((checked: boolean) => {
    setStatus(checked ? 'active' : 'inactive')
    formRef.current?.setFieldsValue({
      status: checked ? 'active' : 'inactive'
    })
    
  }, [formRef]);
  const onSelectDistrict = useCallback((value: number) => {
    let cityId = -1;
    cityViews.forEach((item) => {
      item.districts.forEach((item1) => {
        if(item1.id === value) {
          cityId = item.city_id
        }
      })
    })
    if(cityId !== -1) {
      formRef.current?.setFieldsValue({
        city_id: cityId
      })
    }
  }, [cityViews, formRef])
  const onCreateSuccess = useCallback(() => {
    history.push('/suppliers');
  }, [history])
  const onFinish = useCallback((values: SupplierCreateRequest) => {
    dispatch(SupplierAction.supplierCreateAction(values, onCreateSuccess))
  }, [dispatch, onCreateSuccess])
  //End callback
  //Memo
  const statusValue = useMemo(() => {
    if(!supplier_status) {
      return '';
    }
    let index = supplier_status.findIndex((item) => item.value === status)
    if(index !== -1) {
      return supplier_status[index].name;
    } 
    return '';
  }, [status, supplier_status]);
  //end memo
  useEffect(() => {
    dispatch(AccountAction.SearchAccount({ department_ids: [4] }, setDataAccounts));
    dispatch(getCountry(setCountries))
    dispatch(getDistrictAction(DefaultCountry, setDataDistrict))
  }, [dispatch, setDataAccounts, setDataDistrict]);
  return (
    <Form ref={formRef} layout="vertical" onFinish={onFinish} initialValues={initRequest}>
      <Card
        className="card-block card-block-normal"
        title="Thông tin cơ bản"
        extra={
          <div className="v-extra d-flex align-items-center">
            Trạng thái
            <Switch className="ip-switch" defaultChecked onChange={onChangeStatus} />
            <span style={{color: status === 'active' ? '#27AE60': 'red'}} className="t-status">{statusValue}</span>
            <Item noStyle name="status" hidden>
              <Input value={status} /> 
            </Item>
          </div>
        }
      >
        <Row>
          <Item
            className="form-group form-group-with-search"
            rules={[{ required: true, message: "Vui lòng chọn loại nhà cung cấp" }]}
            label="Loại nhà cung cấp"
            name="type"
          >
            <Radio.Group className="ip-radio">
              {
                supplier_type?.map((item) => (
                  <Radio className="ip-radio-item" value={item.value} key={item.value}>{item.name}</Radio>
                ))
              }
            </Radio.Group>
          </Item>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Mã nhà cung cấp"
              name="code"
            >
              <Input disabled className="r-5" placeholder="Mã nhà cung cấp" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={8} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
              className="form-group form-group-with-search"
              name="name"
              label="Tên nhà cung cấp"
            >
              <Input className="r-5" placeholder="Nhập tên nhà cung cấp" size="large" />
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
                {
                  goods?.map((item) => (<Option key={item.value} value={item.value}>{item.name}</Option>))
                }
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
                {accounts.map((item) => <Option key={item.code} value={item.code}>{item.full_name}</Option>)}
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
        <Panel header="Chi tiết nhà cung cấp" key="1">
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                label="Phân cấp nhà cung cấp"
                name="scorecard"
              >
                <Select className="selector" placeholder="Chọn phân cấp nhà cung cấp">
                  {
                    scorecards?.map((item) => (<Option key={item.value} value={item.value}>{item.name}</Option>))
                  }
                </Select>
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item className="form-group form-group-with-search" label="Thời gian công nợ">
                <Input.Group className="ip-group" size="large" compact>
                  <Item
                    name="debt_time"
                    noStyle
                  >
                    <Input
                      placeholder="Nhập thời gian công nợ"
                      style={{ width: '70%' }}
                      className="ip-text-group"
                      onFocus={(e) => e.target.select()}
                    />
                  </Item>
                  <Item
                    name="debt_time_unit"
                    noStyle
                  >
                    <Select className="selector-group" defaultActiveFirstOption style={{ width: '30%' }}>
                      {
                        date_unit?.map((item) => (<Option key={item.value} value={item.value}>{item.name}</Option>))
                      }
                    </Select>
                  </Item>
                </Input.Group>
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                className="form-group form-group-with-search"
                label="Chứng chỉ"
                name="certifications"
                help={
                  <div className="t-help">Tối đa 1 files (doc, pdf, png, jpeg, jpg) và dung lượng tối đa 3 MB</div>
                }
              >
                <Input className="r-5 ip-upload" multiple type="file" placeholder="Tên danh mục" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item className="form-group form-group-with-search" label="Thời gian công nợ">
                <Input.Group className="ip-group" size="large" compact>
                  <Item
                    name="moq"
                    noStyle
                  >
                    <Input
                      placeholder="Nhập số lượng"
                      style={{ width: '70%' }}
                      className="ip-text-group"
                      onFocus={(e) => e.target.select()}
                    />
                  </Item>
                  <Item
                    name="moq_unit"
                    noStyle
                  >
                    <Select className="selector-group" style={{ width: '30%' }}>
                      {
                        moq_unit?.map((item) => (<Option key={item.value} value={item.value}>{item.name}</Option>))
                      }
                    </Select>
                  </Item>
                </Input.Group>
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={16} md={24} sm={24}>
              <Item
                className="form-group form-group-with-search"
                label="Ghi chú"
                name="note"
              >
                <Input className="r-5 ip-upload" size="large" placeholder="Nhập ghi chú" />
              </Item>
            </Col>
          </Row>
        </Panel>
      </Collapse>
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

export default CreateSupplierScreen;