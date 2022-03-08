import {InfoCircleOutlined} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  TreeSelect
} from "antd";
import StoreTooltip from "assets/icon/store-tooltip.png";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import {AppConfig} from "config/app.config";
import UrlConfig from "config/url.config";
import {AccountSearchAction} from "domain/actions/account/account.action";
import { departmentDetailAction } from "domain/actions/account/department.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  StoreCreateAction,
  StoreGetTypeAction,
  StoreRankAction,
  StoreValidateAction,
} from "domain/actions/core/store.action";
import {AccountResponse} from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import {PageResponse} from "model/base/base-metadata.response";
import {CountryResponse} from "model/content/country.model";
import {DistrictResponse} from "model/content/district.model";
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
import { showSuccess } from "utils/ToastUtils";
import TreeDepartment from "../department/component/TreeDepartment";
import { strForSearch } from "utils/StringUtils";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";

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
  ward_id: null,
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
  vm_code: null,
  department_id: null
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
  const [type, setType] = useState<Array<StoreTypeRequest>>([]);
  const [lstDepartment, setLstDepartment] = useState<Array<DepartmentResponse>>();
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const [formMain] = Form.useForm();

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(false);
      if (!data) {
        return;
      }
      history.push(`${UrlConfig.STORE}/${data.id}`);
      showSuccess("Thêm mới dữ liệu thành công");
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
      setIsLoading(true);
      dispatch(StoreCreateAction(values, onCreateSuccess));
    },
    [dispatch, onCreateSuccess]
  );

  const onResult = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (data) {}
  }, []);

   const onResDepartment = useCallback((data: any) => {
    if (data) {
      setLstDepartment(data);
    }
  }, []);

  const backAction = ()=>{
    setModalConfirm({
      visible: true,
      onCancel: () => {
        setModalConfirm({visible: false});
      },
      onOk: () => {
        history.push(UrlConfig.STORE);
      },
      title: "Bạn có muốn quay lại?",
      subTitle:
        "Sau khi quay lại thay đổi sẽ không được lưu.",
    });
  };

  useEffect(() => {
    if (firstload.current) {
      dispatch(CountryGetAllAction(setCountries));
      dispatch(DistrictGetByCountryAction(DefaultCountry, setCityView));
      dispatch(StoreRankAction(setStoreRank));
      dispatch(StoreGetTypeAction(setType));
      dispatch(
        AccountSearchAction(
          {department_ids: [AppConfig.WM_DEPARTMENT], status: "active"},
          onResult
        )
      );
      dispatch(
        departmentDetailAction(AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : '', onResDepartment)
      );
    }
    firstload.current = true;
  }, [dispatch, onResult, onResDepartment]);

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
        <Row gutter={20}>
          <Col span={18}>
            <Card
              title="Thông tin cửa hàng"
            >
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    normalize={value => value.trimStart()}
                    rules={[
                      {required: true, message: "Vui lòng nhập tên cửa hàng"},
                      {max: 255, message: "Tên cửa hàng không quá 255 kí tự"},
                      {
                        pattern: RegUtil.STRINGUTF8,
                        message: "Tên cửa hàng không gồm kí tự đặc biệt",
                      },
                      // {
                      //   validator: (rule, value, callback) => {
                      //     checkDuplicateStoreName(rule, value, callback);
                      //   },
                      // },
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
                        pattern: RegUtil.PHONE_HOTLINE,
                        message: "Số điện thoại chưa đúng định dạng",
                      },
                    ]}
                    name="hotline"
                    label="Số điện thoại"
                  >
                    <Input placeholder="Nhập số điện thoại" />
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Phường/xã"
                    name="ward_id"
                    rules={[{required: true, message: "Vui lòng chọn phường/xã"}]}
                  >
                    <Select
                      placeholder="Chọn phường/xã"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input: String, option: any) => {
                        if (option.props.value) {
                          return strForSearch(option.props.children).includes(strForSearch(input));
                        }

                        return false;
                      }}
                    >
                      {wards.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col flex="auto">
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item label="Mã bưu điện" name="zip_code">
                    <Input placeholder="Nhập mã bưu điện" />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Trực thuộc"
                    name="department_id"
                    rules={[{required: true, message: "Vui lòng chọn trực thuộc"}]}
                  >
                    <TreeSelect
                      placeholder="Chọn trực thuộc"
                      treeDefaultExpandAll
                      className="selector"
                      allowClear
                      showSearch
                      treeNodeFilterProp='title'
                    >
                      {lstDepartment?.map((item, index) => (
                        <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                      ))}
                    </TreeSelect>
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    name="reference_id"
                    label="Mã tham chiếu"
                  >
                    <InputNumber style={{width:"100%"}} maxLength={10} placeholder="Nhập mã tham chiếu" />
                  </Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Thông tin tình trạng">
              <Row>
                 <Col span={24}>
                    <Item name="status"
                      rules={[{required: true, message: "Vui lòng chọn trạng thái."}]}
                      label="Trạng thái">
                      <Select
                        onChange={(value) => {
                          if (value === "inactive") {
                            formMain.setFieldsValue({
                              is_saleable: false,
                            });
                          }
                        }}
                      >
                        {storeStatusList?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                 </Col>
              </Row>
              <Row>
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
                      <Checkbox disabled={status === "inactive"}>
                        Cho phép bán
                      </Checkbox>
                    </Item>
                  );
                }}
              </Item>
              </Row>
              <Row>
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
                      <Checkbox disabled={status === "inactive"}>
                        Đang kiểm kho
                      </Checkbox>
                    </Item>
                  );
                }}
              </Item>
              </Row>
            </Card>
          </Col>
        </Row>

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
                    label="Diện tích cửa hàng (m²)"
                    name="square"
                  >
                    <NumberInput style={{ textAlign: "left" }} placeholder="Nhập diện tích cửa hàng" />
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="VM phụ trách"
                    name="vm_code"
                    tooltip={{
                      title: "Visual Merchandiser phụ trách",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <AccountSearchPaging placeholder="Chọn VM phụ trách"/>
                  </Item>
                </Col>
              </Row>
            </div>
          </Panel>
        </Collapse>
        <BottomBarContainer
          back={"Quay lại trang danh sách"}
          backAction={backAction}
          rightComponent={
            <Space>
              <Button loading={isLoading} htmlType="submit" type="primary">
                Tạo cửa hàng
              </Button>
            </Space>
          }
        />
      </Form>
      <ModalConfirm
        onCancel={() => {
          setIsShowModalConfirm(false);
        }}
        onOk={() => {
          history.push(UrlConfig.STORE);
        }}
        visible={isShowModalConfirm}
      />
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default StoreCreateScreen;
