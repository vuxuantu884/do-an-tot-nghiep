import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
} from 'antd';
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  GroupGetAction,
  WardGetByDistrictAction,
} from 'domain/actions/content/content.action';
import {
  StoreDetailAction,
  StoreRankAction,
  StoreUpdateAction,
} from 'domain/actions/core/store.action';
import {StoreResponse, StoreUpdateRequest} from 'model/core/store.model';
import {CityView} from 'model/content/district.model';
import {CountryResponse} from 'model/content/country.model';
import {DistrictResponse} from 'model/content/district.model';
import {createRef, useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import {convertDistrict} from 'utils/AppUtils';
import {StoreRankResponse} from 'model/core/store-rank.model';
import {WardResponse} from 'model/content/ward.model';
import {GroupResponse} from 'model/content/group.model';
import CustomDatepicker from 'component/custom/date-picker.custom';
import {useParams} from 'react-router-dom';
import {RootReducerType} from 'model/reducers/RootReducerType';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';
import { RegUtil } from 'utils/RegUtils';

const {Item} = Form;
const {Option, OptGroup} = Select;
const {Panel} = Collapse;

type StoreParam = {
  id: string;
};

const DefaultCountry = 233;

const StoreUpdateScreen: React.FC = () => {
  const {id} = useParams<StoreParam>();
  const idNumber = parseInt(id);
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //State
  const formRef = createRef<FormInstance>();
  const [data, setData] = useState<StoreResponse | null>(null);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [wards, setWards] = useState<Array<WardResponse>>([]);
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const firstload = useRef(true);
  //EndState
  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);
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
      dispatch(WardGetByDistrictAction(value, setWards));
    },
    [cityViews, dispatch, formRef]
  );
  const onUpdateSuccess = useCallback(() => {
    history.push('/suppliers');
  }, [history]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const onFinish = useCallback(
    (values: StoreUpdateRequest) => {
      dispatch(StoreUpdateAction(idNumber, values, onUpdateSuccess));
    },
    [dispatch, idNumber, onUpdateSuccess]
  );
  useEffect(() => {
    if (firstload.current) {
      dispatch(CountryGetAllAction(setCountries));
      dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict));
      dispatch(StoreRankAction(setStoreRank));
      dispatch(GroupGetAction(setGroups));
      if (!Number.isNaN(idNumber)) {
        dispatch(StoreDetailAction(idNumber, setData));
      }
    }
    firstload.current = true;
  }, [dispatch, idNumber, setDataDistrict]);
  useEffect(() => {
    if (data !== null) {
      dispatch(WardGetByDistrictAction(data.district_id, setWards));
    }
  }, [data, dispatch]);
  return (
    <ContentContainer
      title="Sửa cửa hàng"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: UrlConfig.HOME,
        },
        {
          name: 'Cửa hàng',
          path: `${UrlConfig.STORE}`,
        },
        {
          name: 'Sửa cửa hàng',
        },
      ]}
    >
      {data !== null && (
        <Form
          ref={formRef}
          layout="vertical"
          initialValues={data}
          onFinish={onFinish}
        >
          <Card
            
            title="Thông tin cơ bản"
            extra={
              <div className="v-extra d-flex align-items-center">
                <Space key="a" size={15}>
                  <label className="text-default">Trạng thái</label>
                  <Item name="status" noStyle>
                    <Select style={{width: 180}}>
                      {storeStatusList?.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Space>
              </div>
            }
          >
            <div className="padding-20">
              <Row gutter={50}>
                <Item hidden noStyle name="version">
                  <Input />
                </Item>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[
                      {required: true, message: 'Vui lòng nhập tên cửa hàng'},
                    ]}
                    label="Tên cửa hàng"
                    name="name"
                  >
                    <Input placeholder="Nhập tên cửa hàng" />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[
                      {required: true, message: 'Vui lòng nhập số điện thoại'},
                    ]}
                    name="hotline"
                    label="Số điện thoại"
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[{required: true}]}
                    label="Quốc gia"
                    name="country_id"
                  >
                    <Select disabled placeholder="Chọn quốc gia">
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
                    rules={[{required: true, message: 'Vui lòng chọn khu vực'}]}
                    label="Khu vực"
                    name="district_id"
                  >
                    <Select
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
                  </Item>
                  <Item hidden name="city_id">
                    <Input />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Phường/xã"
                    name="ward_id"
                    rules={[
                      {required: true, message: 'Vui lòng chọn phường/xã'},
                    ]}
                  >
                    <Select>
                      <Option value="">Chọn phường xã</Option>
                      {wards.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Địa chỉ"
                    name="address"
                    rules={[
                      {
                        required: true,
                        message: 'Vui lòng nhập địa chỉ',
                      },
                    ]}
                  >
                    <Input placeholder="Nhập địa chỉ" size="large" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Mã bưu điện" name="zip_code">
                    <Input placeholder="Nhập mã bưu điện" />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[
                      {
                        pattern: RegUtil.EMAIL,
                        message: 'Vui lòng nhập đúng định dạng email',
                      },
                    ]}
                    name="mail"
                    label="Email"
                  >
                    <Input placeholder="Nhập địa chỉ email" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Diện tích cửa hàng" name="square">
                    <Input placeholder="Nhập diện tích cửa hàng" />
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[
                      {required: true, message: 'Vui lòng chọn trực thuộc'},
                    ]}
                    label="Trực thuộc"
                    name="group_id"
                  >
                    <Select placeholder="Chọn trực thuộc">
                      {groups.map((i, index) => (
                        <Option key={i.id} value={i.id}>
                          {i.name}
                        </Option>
                      ))}
                    </Select>
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
            <Panel key="1" header="Thông tin khác">
              <div className="padding-20">
                <Row gutter={50}>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Item label="Phân cấp" name="rank">
                      <Select>
                        <Option value={''}>Chọn phân cấp</Option>
                        {storeRanks.map((i, index) => (
                          <Option key={i.id} value={i.id}>
                            {i.code}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Item label="Ngày mở cửa" name="begin_date">
                      <CustomDatepicker
                        style={{width: '100%'}}
                        placeholder="Chọn ngày mở cửa"
                      />
                    </Item>
                  </Col>
                </Row>
              </div>
            </Panel>
          </Collapse>
          <div className="margin-top-20" style={{textAlign: 'right'}}>
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
      )}
    </ContentContainer>
  );
};

export default StoreUpdateScreen;
