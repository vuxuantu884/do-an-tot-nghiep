import {InfoCircleOutlined} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Select,
  Space,
} from "antd";
import StoreTooltip from "assets/icon/store-tooltip.png";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  GroupGetAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  StoreCreateAction,
  StoreGetTypeAction,
  StoreRankAction,
  StoreValidateAction,
} from "domain/actions/core/store.action";
import {CountryResponse} from "model/content/country.model";
import {DistrictResponse} from "model/content/district.model";
import {GroupResponse} from "model/content/group.model";
import {WardResponse} from "model/content/ward.model";
import {StoreRankResponse} from "model/core/store-rank.model";
import {
  StoreCreateRequest,
  StoreResponse,
  StoreTypeRequest,
} from "model/core/store.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {RuleObject, StoreValue} from "rc-field-form/lib/interface";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {RegUtil} from "utils/RegUtils";

const {Item} = Form;
const {Panel} = Collapse;
const {Option} = Select;
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
  is_saleable: true,
  is_stocktaking: false,
  type: null,
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
  const [type, setType] = useState<Array<StoreTypeRequest>>([]); 
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const [formMain] = Form.useForm();

  //EndState 

  //ref
  const firstload = useRef(true);
  const debounceSearchStoreNameRef = useRef<ReturnType<typeof setTimeout>>();

  const onSelectDistrict = useCallback(
    (value: number) => {
      let cityId = -1;
      cityViews.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
        }
      });
      if (cityId !== -1) {
        formMain.setFieldsValue({
          city_id: cityId,
        });
      }
      dispatch(WardGetByDistrictAction(value, setWards));
    },
    [cityViews, dispatch, formMain]
  );
  const onCreateSuccess = useCallback(
    (data: StoreResponse | false) => {
      if (!data) {
        return;
      }
      history.push(`${UrlConfig.STORE}/${data.id}`);
    },
    [history]
  ); 

  const checkDuplicateStoreName = (
    rule: RuleObject,
    value: StoreValue,
    callback: (error?: string) => void
  ) => {
    if (debounceSearchStoreNameRef.current) {
      clearTimeout(debounceSearchStoreNameRef.current);
    }

    debounceSearchStoreNameRef.current = setTimeout(() => {
      dispatch(
        StoreValidateAction({name: value}, (data) => {
          console.log(data);
          if (data instanceof Array) {
            callback("Tên cửa hàng đã tồn tại");
          } else {
            callback();
          }
        })
      );
    }, 300);
  };
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
      dispatch(StoreGetTypeAction(setType));
    }
    firstload.current = true;
  }, [dispatch]);

  return (
    <ContentContainer
      title="Thêm mới cửa hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
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
        form={formMain}
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
                  <Select
                    onChange={(value) => {
                      if (value === "inactive") {
                        console.log(formMain.getFieldsValue(true));
                        formMain.setFieldsValue({
                          is_saleable: false,
                        });
                      }
                    }}
                    style={{width: 180}}
                  >
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
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                noStyle
                shouldUpdate={(prev, current) =>
                  prev.is_saleable !== current.is_saleable ||
                  prev.status !== current.status
                }
              >
                {({getFieldValue}) => {
                  let status = getFieldValue("status");
                  return (
                    <Item valuePropName="checked" name="is_saleable">
                      <Checkbox disabled={status === "inactive"}>Cho phép bán</Checkbox>
                    </Item>
                  );
                }}
              </Item>
            </Col> 
          </Row>
          <Row gutter={50}>
            <Col>
              <Item
                noStyle
                shouldUpdate={(prev, current) =>
                  prev.is_saleable !== current.is_saleable ||
                  prev.status !== current.status
                }
              >
                {({getFieldValue}) => {
                  let status = getFieldValue("status");
                  return (
                    <Item valuePropName="checked" name="is_stocktaking">
                      <Checkbox disabled={status === "inactive"}>Đang kiểm kho</Checkbox>
                    </Item>
                  );
                }}
              </Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                rules={[
                  {required: true, message: "Vui lòng nhập tên danh mục"},
                  {max: 255, message: "Tên danh mục không quá 255 kí tự"},
                  {
                    pattern: RegUtil.STRINGUTF8,
                    message: "Tên danh mục không gồm kí tự đặc biệt",
                  },
                  {
                    validator: (rule, value, callback) => {
                      checkDuplicateStoreName(rule, value, callback);
                    },
                  },
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
              <Item rules={[{required: true}]} label="Quốc gia" name="country_id">
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
                rules={[{required: true, message: "Vui lòng chọn khu vực"}]}
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
                rules={[{required: true, message: "Vui lòng chọn phường/xã"}]}
              >
                <Select placeholder="Chọn phường/xã" showSearch optionFilterProp="children">
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
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                rules={[{required: true, message: "Vui lòng chọn loại cửa hàng"}]}
                label="Phân loại"
                name="type"
              >
                <Select
                  showSearch
                  showArrow
                  optionFilterProp="children"
                  placeholder="Chọn phân loại"
                >
                  {type?.map((item: StoreTypeRequest, index) => (
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
        </Card>
        <Collapse
          style={{marginBottom: 50}}
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
                    tooltip={{
                      overlayStyle: {
                        backgroundColor: "transparent",
                        color: "transparent",
                        width: 1000,
                        maxWidth: 1000,
                      },
                      overlayInnerStyle: {
                        padding: 0,
                      },
                      title: () => (
                        <div style={{width: 1000, display: "flex"}}>
                          <img style={{width: 1000}} src={StoreTooltip} alt="" />
                        </div>
                      ),
                      icon: <InfoCircleOutlined />,
                    }}
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
                    rules={[{required: true, message: "Vui lòng chọn trực thuộc"}]}
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
                      icon: <InfoCircleOutlined />,
                    }}
                    name="begin_date"
                  >
                    <CustomDatepicker
                      style={{width: "100%"}}
                      placeholder="Chọn ngày mở cửa"
                    />
                  </Item>
                </Col>
              </Row>
            </div>
          </Panel>
        </Collapse>
        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space> 
              <Button htmlType="submit" type="primary">
                Tạo cửa hàng
              </Button>
            </Space>
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default StoreCreateScreen;
