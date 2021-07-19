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
} from "antd";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  GroupGetAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  StoreCreateAction,
  StoreRankAction,
} from "domain/actions/core/store.action";
import { StoreCreateRequest } from "model/core/store.model";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { StoreRankResponse } from "model/core/store-rank.model";
import { WardResponse } from "model/content/ward.model";
import { GroupResponse } from "model/content/group.model";
import CustomDatepicker from "component/custom/date-picker.custom";
import { RootReducerType } from "model/reducers/RootReducerType";
import UrlConfig from "config/UrlConfig";
import ContentContainer from "component/container/content.container";
import { RegUtil } from "utils/RegUtils";
import NumberInput from "component/custom/number-input.custom";

const { Item } = Form;
const { Panel } = Collapse;
const { Option } = Select;
const DefaultCountry = 233;
const initRequest: StoreCreateRequest = {
  name: "",
  hotline: "",
  country_id: DefaultCountry,
  city_id: null,
  district_id: null,
  ward_id: "",
  address: "",
  zip_code: null,
  email: null,
  square: null,
  rank: "",
  status: "active",
  begin_date: null,
  latitude: null,
  longtitude: null,
  group_id: null,
};

const StoreCreateScreen: React.FC = () => {
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //State
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<DistrictResponse>>([]);
  const [wards, setWards] = useState<Array<WardResponse>>([]);
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const formRef = createRef<FormInstance>();
  const firstload = useRef(true);
  //EndState
  const onSelectDistrict = useCallback(
    (value: number) => {
      let cityId = -1;
      cityViews.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
        }
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
  const onCreateSuccess = useCallback(() => {
    history.push(UrlConfig.STORE);
  }, [history]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);
  const onFinish = useCallback(
    (values: StoreCreateRequest) => {
      dispatch(StoreCreateAction(values, onCreateSuccess));
    },
    [dispatch, onCreateSuccess]
  );
  useEffect(() => {
    if (firstload.current) {
      dispatch(CountryGetAllAction(setCountries));
      dispatch(DistrictGetByCountryAction(DefaultCountry, setCityView));
      dispatch(StoreRankAction(setStoreRank));
      dispatch(GroupGetAction(setGroups));
    }
    firstload.current = true;
  }, [dispatch]);
  return (
    <ContentContainer
      title="Thêm mới cửa hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Cửa hàng",
          path: `${UrlConfig.STORE}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form
        ref={formRef}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initRequest}
      >
        <Card
          title="Thông tin cửa hàng"
          extra={
            <div className="v-extra d-flex align-items-center">
              <Space key="a" size={15}>
                <label className="text-default">Trạng thái</label>
                <Item name="status" noStyle>
                  <Select style={{ width: 180 }}>
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
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  rules={[
                    {required: true, message: 'Vui lòng nhập tên danh mục'},
                    {max: 255, message: 'Tên danh mục không quá 255 kí tự'},
                    {pattern: RegUtil.STRINGUTF8, message: 'Tên danh mục không gồm kí tự đặc biệt'},
                  ]}
                  label="Tên cửa hàng"
                  name="name"
                >
                  <Input maxLength={255} placeholder="Nhập tên cửa hàng" />
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
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
                  rules={[{ required: true }]}
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
                  rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}
                  label="Khu vực"
                  name="district_id"
                >
                  <Select
                    showSearch
                    showArrow
                    optionFilterProp="children"
                    onSelect={onSelectDistrict}
                    placeholder="Chọn khu vực"
                  >
                    {cityViews?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.city_name} - {item.name}
                      </Option>
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
                    { required: true, message: "Vui lòng chọn phường/xã" },
                  ]}
                >
                  <Select showSearch>
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
                      message: "Vui lòng nhập địa chỉ",
                    },
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ" />
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
                      message: "Vui lòng nhập đúng định dạng email",
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
                <Item
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập diện tích cửa hàng",
                    },
                  ]}
                  label="Diện tích cửa hàng (m²)"
                  name="square"
                >
                  <NumberInput placeholder="Nhập diện tích cửa hàng" />
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
                  <Item
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phân cấp cửa hàng",
                      },
                    ]}
                    label="Phân cấp"
                    name="rank"
                  >
                    <Select>
                      <Option value={""}>Chọn phân cấp</Option>
                      {storeRanks.map((i, index) => (
                        <Option key={i.id} value={i.id}>
                          {i.code}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    rules={[
                      { required: true, message: "Vui lòng chọn trực thuộc" },
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
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Ngày mở cửa"
                    tooltip={{
                      title: "Ngày mở cửa là ngày đưa hàng vào hoạt động",
                    }}
                    name="begin_date"
                  >
                    <CustomDatepicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày mở cửa"
                    />
                  </Item>
                </Col>
              </Row>
            </div>
          </Panel>
        </Collapse>
        <div className="margin-top-20" style={{ textAlign: "right" }}>
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
    </ContentContainer>
  );
};

export default StoreCreateScreen;
