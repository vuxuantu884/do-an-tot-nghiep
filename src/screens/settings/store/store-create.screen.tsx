import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, TreeSelect } from "antd";
import StoreTooltip from "assets/icon/store-tooltip.png";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { departmentDetailAction } from "domain/actions/account/department.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { StoreCreateAction, StoreGetTypeAction, StoreRankAction } from "domain/actions/core/store.action";
import { AccountResponse } from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { WardResponse } from "model/content/ward.model";
import { StoreRankResponse } from "model/core/store-rank.model";
import { StoreCreateRequest, StoreResponse, StoreTypeRequest } from "model/core/store.model";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import TreeDepartment from "../department/component/TreeDepartment";
import { strForSearch } from "utils/StringUtils";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { Map } from "component/ggmap";
import "./styles.scss";
import copy from "copy-to-clipboard";
import { callApiNative } from "utils/ApiUtils";
import { getPlaceDetailApi } from "service/core/store.services";
import { getWardApi } from "service/content/content.service";

const DefaultLocation = { lat: 21.0228161, lng: 105.8019439 };
const API_KEY = "AIzaSyB6sGeWZ-0xWzRNGK0eCCdZW1CtzYTfJ0g";

const { Item } = Form;
const { Option } = Select;
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
  longitude: null,
  group_id: null,
  is_saleable: true,
  is_stocktaking: false,
  type: null,
  vm_code: null,
  department_id: null,
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
  const [formMain] = Form.useForm();

  const [defaultLocation] = useState(DefaultLocation);
  const [location, setLocation] = useState(defaultLocation);

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusStore, setStatusStore] = useState("active");
  const [isSaleable, setIsSaleable] = useState("active");
  const [isStocktaking, setIsStocktaking] = useState("inactive");

  //EndState

  //ref
  const firstload = useRef(true);
  // const debounceSearchStoreNameRef = useRef<ReturnType<typeof setTimeout>>();

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
    [cityViews, dispatch, formMain],
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
    [history],
  );

  const onFinish = useCallback(
    (values: StoreCreateRequest) => {
      setIsLoading(true);
      let newData: any = { ...values };
      const coordinates = newData.coordinates?.replaceAll(" ", "").split(",");

      newData = {
        ...newData,
        status: statusStore,
        is_saleable: isSaleable === "active",
        is_stocktaking: isStocktaking === "active",
        latitude: coordinates && coordinates.length > 0 ? coordinates[0] : "",
        longitude: coordinates && coordinates.length > 0 ? coordinates[1] : "",
      };

      delete newData.coordinates;
      delete newData.iframe;

      dispatch(StoreCreateAction(newData, onCreateSuccess));
    },
    [dispatch, isSaleable, isStocktaking, onCreateSuccess, statusStore],
  );

  const onResult = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (data) {
    }
  }, []);

  const onResDepartment = useCallback((data: any) => {
    if (data) {
      setLstDepartment(data);
    }
  }, []);

  const backAction = () => {
    setModalConfirm({
      visible: true,
      onCancel: () => {
        setModalConfirm({ visible: false });
      },
      onOk: () => {
        history.push(UrlConfig.STORE);
      },
      title: "Bạn có muốn quay lại?",
      subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
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
          { department_ids: [AppConfig.WM_DEPARTMENT], status: "active" },
          onResult,
        )
      );
      dispatch(
        departmentDetailAction(AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : "", onResDepartment),
      );
    }
    firstload.current = true;
  }, [dispatch, onResult, onResDepartment]);

  const onMarkerDrag = (coordinates: any) => {
    const { latLng } = coordinates;

    const iframe = `<iframe width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={\`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${latLng.lat()},${latLng.lng()}\`} />`;

    setLocation({
      lat: latLng.lat(),
      lng: latLng.lng(),
    });

    formMain.setFieldsValue({
      coordinates: `${latLng.lat()}, ${latLng.lng()}`,
      link_google_map: `https://www.google.com/maps/search/?api=1&query=${latLng.lat()},${latLng.lng()}`,
      iframe: iframe,
    });
  };

  const selectPlace = async (e: any) => {
    const newLocation = JSON.parse(e?.value).location;
    const address = JSON.parse(e?.value).address;

    const iframe = `<iframe width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={\`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${newLocation.lat},${newLocation.lng}\`} />`;

    setLocation({ ...newLocation });

    formMain.setFieldsValue({
      coordinates: `${newLocation.lat}, ${newLocation.lng}`,
      link_google_map: `https://www.google.com/maps/search/?api=1&query=${newLocation.lat},${newLocation.lng}`,
      iframe,
      address
    });

    //get place

    const res = await callApiNative({ isShowLoading: false }, dispatch, getPlaceDetailApi, {
      key: API_KEY,
      place_id: JSON.parse(e?.value).place_id,
    });

    const addressComponents = JSON.parse(res).result.address_components;
    const districtSelected = addressComponents.filter((i: any) => i.types.indexOf('administrative_area_level_2') !== -1);
    if (districtSelected.length > 0) {
      const citySelected = cityViews.filter((i) => i.name.indexOf(districtSelected[0].long_name) !== -1);

      formMain.setFieldsValue({
        district_id: citySelected.length > 0 ? citySelected[0].id : null,
        city_id: citySelected.length > 0 ? citySelected[0].city_id : null,
      });

      const wardRes = await callApiNative({ isShowLoading: false }, dispatch, getWardApi, citySelected[0].id);
      setWards(wardRes);

      const wardSelected = addressComponents.filter((i: any) => i.types.indexOf('sublocality_level_1') !== -1);
      if (wardSelected.length > 0) {
        const wardSelectedForm = wardRes.filter((i: any) => i.name.indexOf(wardSelected[0].long_name) !== -1);

        formMain.setFieldsValue({
          ward_id: wardSelectedForm.length > 0 ? wardSelectedForm[0].id : '',
        });
      } else {
        formMain.setFieldsValue({
          ward_id: '',
        });
      }
    } else {
      formMain.setFieldsValue({
        district_id: '',
        city_id: '',
      });
    }
  };

  const copyCode = () => {
    copy(formMain.getFieldValue("iframe"));
    showSuccess("Đã sao chép!");
  };

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
      <Form form={formMain} layout="vertical" onFinish={onFinish} initialValues={initRequest}>
        <Row gutter={20} className="store-create-screen">
          <Col span={18}>
            <Card title="Thông tin cửa hàng">
              <Row gutter={50}>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    normalize={(value) => value.trimStart()}
                    rules={[
                      { required: true, message: "Vui lòng nhập tên cửa hàng" },
                      { max: 255, message: "Tên cửa hàng không quá 255 kí tự" },
                      {
                        pattern: RegUtil.STRINGUTF8,
                        message: "Tên cửa hàng không gồm kí tự đặc biệt",
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
                  <Item rules={[{ required: true }]} label="Quốc gia" name="country_id">
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
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item
                    label="Phường/xã"
                    name="ward_id"
                    rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
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
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại cửa hàng",
                      },
                    ]}
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
                    label="Phòng ban tương ứng"
                    name="department_id"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phòng ban tương ứng",
                      },
                    ]}
                  >
                    <TreeSelect
                      placeholder="Chọn phòng ban tương ứng"
                      treeDefaultExpandAll
                      className="selector"
                      allowClear
                      showSearch
                      treeNodeFilterProp="title"
                    >
                      {lstDepartment?.map((item, index) => (
                        <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                      ))}
                    </TreeSelect>
                  </Item>
                </Col>
                <Col span={24} lg={8} md={12} sm={24}>
                  <Item name="reference_id" label="Mã tham chiếu">
                    <InputNumber
                      style={{ width: "100%" }}
                      maxLength={10}
                      placeholder="Nhập mã tham chiếu"
                    />
                  </Item>
                </Col>
              </Row>
            </Card>

            <Card title="Bản đồ định vị cửa hàng">
              <Map
                onSelect={selectPlace}
                center={location}
                styles={{ width: "100%", height: 478 }}
                onMarkerDrag={onMarkerDrag}
              />
              <Row gutter={50} className="margin-top-20">
                <Col span={12}>
                  <Item label="Tọa độ (kinh độ, vĩ độ)" name="coordinates">
                    <Input placeholder="Nhập tọa độ" maxLength={255} />
                  </Item>
                </Col>
                <Col span={12}>
                  <Item label="Link Google Map" name="link_google_map">
                    <Input placeholder="Nhập Link Google Map" maxLength={255} />
                  </Item>
                </Col>
                <Col span={24}>
                  <div>
                    <div>Mã nhúng bản đồ</div>
                    <div className="copy-text right" onClick={() => copyCode()}>SAO CHÉP MÃ</div>
                  </div>
                  <Item name="iframe">
                    <Input placeholder="<iframe..." />
                  </Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Thông tin tình trạng">
              <Row>
                <Col span={24}>
                  <div className="status-info">
                    <div>Trạng thái: {statusStore === "active" ? <span className="success">Đang hoạt động</span> :
                      <span className="danger">Ngừng hoạt động</span>}</div>
                    <div className="right"><Switch checked={statusStore === "active"} onChange={(e) => {
                      setStatusStore(e ? "active" : "inactive");
                      if (!e) {
                        setIsSaleable("inactive");
                        setIsStocktaking("inactive");
                      }
                    }} /></div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <div className="status-info">
                    <div>Cho phép bán:</div>
                    <div className="right"><Switch checked={isSaleable === "active"} onChange={(e) => {
                      if (statusStore === 'inactive') return;
                      setIsSaleable(e ? "active" : "inactive");
                    }} /></div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <div className="status-info">
                    <div>Đang kiểm kho:</div>
                    <div className="right"><Switch checked={isStocktaking === "active"} onChange={(e) => {
                      if (statusStore === 'inactive') return;
                      setIsStocktaking(e ? "active" : "inactive");
                    }} /></div>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card title="Thông tin khác">
              <Row gutter={50}>
                <Col span={24}>
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
                        <div style={{ width: 1000, display: "flex" }}>
                          <img style={{ width: 1000 }} src={StoreTooltip} alt="" />
                        </div>
                      ),
                      icon: <InfoCircleOutlined />,
                    }}
                    label="Hạng cửa hàng"
                    name="rank"
                  >
                    <Select>
                      {storeRanks.map((i) => (
                        <Option key={i.id} value={i.id}>
                          {i.code}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col span={24}>
                  <Item
                    label="Diện tích cửa hàng (m²)"
                    name="square"
                    rules={[
                      { required: true, message: "Vui lòng nhập diện tích" },
                    ]}
                  >
                    <NumberInput
                      style={{ textAlign: "left" }}
                      placeholder="Nhập diện tích cửa hàng"
                    />
                  </Item>
                </Col>
              </Row>
              <Row gutter={50}>
                <Col span={24}>
                  <Item
                    label="Ngày mở cửa"
                    tooltip={{
                      title: "Ngày mở cửa là ngày đưa hàng vào hoạt động",
                      icon: <InfoCircleOutlined />,
                    }}
                    name="begin_date"
                  >
                    <CustomDatepicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày mở cửa"
                    />
                  </Item>
                </Col>
                <Col span={24}>
                  <Item
                    label="Cửa hàng trưởng"
                    name="store_manager_code"
                  >
                    <AccountSearchPaging placeholder="Chọn cửa hàng trưởng" />
                  </Item>
                </Col>
                <Col span={24}>
                  <Item
                    label="VM phụ trách"
                    name="vm_code"
                    tooltip={{
                      title: "Visual Merchandiser phụ trách",
                      icon: <InfoCircleOutlined />,
                    }}
                  >
                    <AccountSearchPaging placeholder="Chọn VM phụ trách" />
                  </Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

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
