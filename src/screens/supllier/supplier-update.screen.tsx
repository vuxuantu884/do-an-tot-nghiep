import {
  Button,
  Card,
  Col,
  Space,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Switch,
  Divider,
  Collapse,
} from 'antd';
import {AccountSearchAction} from 'domain/actions/account/account.action';
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from 'domain/actions/content/content.action';
import {SupplierDetailAction, SupplierUpdateAction} from 'domain/actions/core/supplier.action';
import {CityView} from 'model/content/district.model';
import {RootReducerType} from 'model/reducers/RootReducerType';
import {SupplierDetail, SupplierResponse, SupplierUpdateRequest} from 'model/core/supplier.model';
import {AccountResponse} from 'model/account/account.model';
import {PageResponse} from 'model/base/base-metadata.response';
import {CountryResponse} from 'model/content/country.model';
import {DistrictResponse} from 'model/content/district.model';
import {createRef, useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {convertDistrict, convertSupplierResponseToDetail} from 'utils/AppUtils';
import {AppConfig} from 'config/AppConfig';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';

const {Item} = Form;
const {Option, OptGroup} = Select;
type SupplierParam = {
  id: string;
};

const DefaultCountry = 233;

const UpdateSupplierScreen: React.FC = () => {
  const {id} = useParams<SupplierParam>();
  let idNumber = parseInt(id);
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();
  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const scorecards = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard
  );
  const date_unit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.date_unit
  );
  const moq_unit = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.moq_unit
  );
  const supplier_status = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_status
  );
  //State
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>();
  const [supplier, setSupplier] = useState<SupplierDetail | null> (null);
  //EndState
  //Callback
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);
  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);
  const onChangeStatus = useCallback(
    (checked: boolean) => {
      setStatus(checked ? 'active' : 'inactive');
      formRef.current?.setFieldsValue({
        status: checked ? 'active' : 'inactive',
      });
    },
    [formRef]
  );
  const onSelectDistrict = useCallback(
    (value: number) => {
      let cityId = -1;
      cityViews.forEach((item) => {
        item.districts.forEach((item1) => {
          if (item1.id === value) {
            cityId = item.city_id;
          }
        });
      });
      if (cityId !== -1) {
        formRef.current?.setFieldsValue({
          city_id: cityId,
        });
      }
    },
    [cityViews, formRef]
  );
  const onUpdateSuccess = useCallback(() => {
    history.push('/suppliers');
  }, [history]);
  const onFinish = useCallback(
    (values: SupplierUpdateRequest) => {
      dispatch(SupplierUpdateAction(idNumber, values, onUpdateSuccess));
    },
    [dispatch, onUpdateSuccess]
  );
  const onCancel = useCallback(() => history.goBack(), [history]);
  //End callback
  //Memo
  const statusValue = useMemo(() => {
    if (!supplier_status) {
      return '';
    }
    let index = supplier_status.findIndex((item) => item.value === status);
    if (index !== -1) {
      return supplier_status[index].name;
    }
    return '';
  }, [status, supplier_status]);

  const setSupplierDetail = useCallback((data: SupplierResponse) => {
    let detail = convertSupplierResponseToDetail(data);
    setSupplier(detail);
  }, []);

      //end memo
  useEffect(() => {
    dispatch(
      AccountSearchAction(
        {department_ids: [AppConfig.WIN_DEPARTMENT]},
        setDataAccounts
      )
    );
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict));
    if (!Number.isNaN(idNumber)) {
      dispatch(SupplierDetailAction(idNumber, setSupplierDetail));
    }
  }, [dispatch, setDataAccounts, setDataDistrict]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: '/',
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Nhà cung cấp',
          path: `${UrlConfig.SUPPLIERS}`,
        },
        {
          name: 'Sửa nhà cung cấp',
        },
      ]}
    >
      {
        supplier !== null && (
            <Form
                ref={formRef}
                layout="vertical"
                onFinish={onFinish}
                initialValues={supplier}
            >
              <Form.Item hidden noStyle name="version">
                <Input />
              </Form.Item>
              <Card
                  title="Thông tin cơ bản"
                  extra={[
                    <Space size={15}>
                      <label className="text-default">Trạng thái</label>
                      <Switch
                          onChange={onChangeStatus}
                          className="ant-switch-success"
                          defaultChecked
                      />
                      <label
                          className={status === 'active' ? 'text-success' : 'text-error'}
                      >
                        {statusValue}
                      </label>
                      <Item noStyle name="status" hidden>
                        <Input value={status} />
                      </Item>
                    </Space>,
                  ]}
              >
                <div className="padding-20">
                  <Row>
                    <Item
                        rules={[
                          {required: true, message: 'Vui lòng chọn loại nhà cung cấp'},
                        ]}
                        label="Loại nhà cung cấp"
                        name="type"
                    >
                      <Radio.Group className="ip-radio">
                        {supplier_type?.map((item) => (
                            <Radio
                                className="ip-radio-item"
                                value={item.value}
                                key={item.value}
                            >
                              {item.name}
                            </Radio>
                        ))}
                      </Radio.Group>
                    </Item>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item label="Mã nhà cung cấp" name="code">
                        <Input
                            disabled
                            className="r-5"
                            placeholder="Mã nhà cung cấp"
                            size="large"
                        />
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item
                          rules={[
                            {required: true, message: 'Vui lòng nhập tên nhà cung cấp'},
                          ]}
                          name="name"
                          label="Tên nhà cung cấp"
                      >
                        <Input
                            className="r-5"
                            placeholder="Nhập tên nhà cung cấp"
                            size="large"
                        />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item
                          rules={[{required: true, message: 'Vui lòng chọn ngành hàng'}]}
                          name="goods"
                          label="Ngành hàng"
                      >
                        <Select
                            mode="multiple"
                            className="selector"
                            placeholder="Chọn ngành hàng"
                        >
                          {goods?.map((item) => (
                              <Option key={item.value} value={item.value}>
                                {item.name}
                              </Option>
                          ))}
                        </Select>
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng chọ nhân viên phụ trách',
                            },
                          ]}
                          name="person_in_charge"
                          label="Nhân viên phụ trách"
                      >
                        <Select
                            placeholder="Chọn nhân viên phụ trách"
                            className="selector"
                        >
                          {accounts.map((item) => (
                              <Option key={item.code} value={item.code}>
                                {item.full_name}
                              </Option>
                          ))}
                        </Select>
                      </Item>
                    </Col>
                  </Row>
                  <Divider orientation="left">Thông tin khác</Divider>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item label="Quốc gia" name="country_id">
                        <Select
                            disabled
                            className="selector"
                            placeholder="Chọn ngành hàng"
                        >
                          {countries?.map((item) => (
                              <Option key={item.id} value={item.id}>
                                {item.name}
                              </Option>
                          ))}
                        </Select>
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item
                          rules={[
                            {required: true, message: 'Vui lòng nhập người liên hệ'},
                          ]}
                          name="contact_name"
                          label="Người liên hệ"
                      >
                        <Input
                            className="r-5"
                            placeholder="Nhập người liên hệ"
                            size="large"
                        />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item label="Khu vực" name="district_id">
                        <Select
                            showSearch
                            onSelect={onSelectDistrict}
                            className="selector"
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
                      </Item>
                      <Item hidden name="city_id">
                        <Input />
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item
                          rules={[
                            {required: true, message: 'Vui lòng nhập số điện thoại'},
                          ]}
                          name="phone"
                          label="Số điện thoại"
                      >
                        <Input
                            className="r-5"
                            placeholder="Nhập số điện thoại"
                            size="large"
                        />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item label="Địa chỉ" name="address">
                        <Input
                            className="r-5"
                            placeholder="Nhập địa chỉ"
                            size="large"
                        />
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item name="email" label="Nhập email">
                        <Input className="r-5" placeholder="Nhập email" size="large" />
                      </Item>
                    </Col>
                  </Row>
                  <Row gutter={50}>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item label="Website" name="website">
                        <Input
                            className="r-5"
                            placeholder="Nhập website"
                            size="large"
                        />
                      </Item>
                    </Col>
                    <Col span={24} lg={8} md={12} sm={24}>
                      <Item name="tax_code" label="Mã số thuế">
                        <Input
                            className="r-5"
                            placeholder="Nhập mã số thuế"
                            size="large"
                        />
                      </Item>
                    </Col>
                  </Row>
                </div>
              </Card>
              <Collapse
                  defaultActiveKey="1"
                  className="ant-collapse-card margin-top-20"
                  expandIconPosition="right"
              >
                <Collapse.Panel key="1" header="Chi tiết nhà cung cấp">
                  <div className="padding-20">
                    <Row gutter={50}>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item label="Phân cấp nhà cung cấp" name="scorecard">
                          <Select
                              className="selector"
                              placeholder="Chọn phân cấp nhà cung cấp"
                          >
                            {scorecards?.map((item) => (
                                <Option key={item.value} value={item.value}>
                                  {item.name}
                                </Option>
                            ))}
                          </Select>
                        </Item>
                      </Col>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item label="Thời gian công nợ">
                          <Input.Group className="ip-group" size="large" compact>
                            <Item name="debt_time" noStyle>
                              <Input
                                  placeholder="Nhập thời gian công nợ"
                                  style={{width: '70%'}}
                                  className="ip-text-group"
                                  onFocus={(e) => e.target.select()}
                              />
                            </Item>
                            <Item name="debt_time_unit" noStyle>
                              <Select
                                  className="selector-group"
                                  defaultActiveFirstOption
                                  style={{width: '30%'}}
                              >
                                {date_unit?.map((item) => (
                                    <Option key={item.value} value={item.value}>
                                      {item.name}
                                    </Option>
                                ))}
                              </Select>
                            </Item>
                          </Input.Group>
                        </Item>
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item
                            label="Chứng chỉ"
                            name="certifications"
                            help={
                              <div className="t-help">
                                Tối đa 1 files (doc, pdf, png, jpeg, jpg) và dung lượng
                                tối đa 3 MB
                              </div>
                            }
                        >
                          <Input
                              className="r-5 ip-upload"
                              multiple
                              type="file"
                              placeholder="Tên danh mục"
                          />
                        </Item>
                      </Col>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item label="Số lượng đặt hàng tối thiểu">
                          <Input.Group className="ip-group" size="large" compact>
                            <Item name="moq" noStyle>
                              <Input
                                  placeholder="Nhập số lượng"
                                  style={{width: '70%'}}
                                  className="ip-text-group"
                                  onFocus={(e) => e.target.select()}
                              />
                            </Item>
                            <Item name="moq_unit" noStyle>
                              <Select className="selector-group" style={{width: '30%'}}>
                                {moq_unit?.map((item) => (
                                    <Option key={item.value} value={item.value}>
                                      {item.name}
                                    </Option>
                                ))}
                              </Select>
                            </Item>
                          </Input.Group>
                        </Item>
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} lg={16} md={24} sm={24}>
                        <Item label="Ghi chú" name="note">
                          <Input
                              className="r-5 ip-upload"
                              size="large"
                              placeholder="Nhập ghi chú"
                          />
                        </Item>
                      </Col>
                    </Row>
                  </div>
                </Collapse.Panel>
              </Collapse>
              <Collapse
                  defaultActiveKey="1"
                  className="ant-collapse-card margin-top-20"
                  expandIconPosition="right"
              >
                <Collapse.Panel key="1" header="Thông tin giá">
                  <div className="padding-20">
                    <Row gutter={50}>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item label="Ngân hàng" name="bank_name">
                          <Input
                              className="r-5"
                              placeholder="Nhập ngân hàng"
                              size="large"
                          />
                        </Item>
                      </Col>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item name="bank_brand" label="Chi nhánh">
                          <Input
                              className="r-5"
                              placeholder="Nhập chi nhánh"
                              size="large"
                          />
                        </Item>
                      </Col>
                    </Row>
                    <Row gutter={50}>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item label="Số tài khoản" name="bank_number">
                          <Input
                              className="r-5"
                              placeholder="Nhập số tài khoản"
                              size="large"
                          />
                        </Item>
                      </Col>
                      <Col span={24} lg={8} md={12} sm={24}>
                        <Item name="beneficiary_name" label="Chủ tài khoản">
                          <Input
                              className="r-5"
                              placeholder="Nhập chủ tài khoản"
                              size="large"
                          />
                        </Item>
                      </Col>
                    </Row>
                  </div>
                </Collapse.Panel>
              </Collapse>
              <div className="margin-top-10" style={{textAlign: 'right'}}>
                <Space size={12}>
                  <Button type="default" onClick={onCancel}>
                    Hủy
                  </Button>
                  <Button htmlType="submit" type="primary">
                    Lưu
                  </Button>
                </Space>
              </div>
            </Form>
        )
      }

    </ContentContainer>
  );
};

export default UpdateSupplierScreen;
