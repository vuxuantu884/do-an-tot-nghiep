import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Switch, TreeSelect } from "antd";
import StoreTooltip from "assets/icon/store-tooltip.png";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  StoreDetailAction,
  StoreGetTypeAction,
  StoreRankAction,
  StoreUpdateAction,
  StoreValidateAction,
} from "domain/actions/core/store.action";
import { StoreResponse, StoreTypeRequest, StoreUpdateRequest } from "model/core/store.model";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { StoreRankResponse } from "model/core/store-rank.model";
import { WardResponse } from "model/content/ward.model";
import CustomDatepicker from "component/custom/date-picker.custom";
import { useParams } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { RegUtil } from "utils/RegUtils";
import BottomBarContainer from "component/container/bottom-bar.container";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AppConfig } from "config/app.config";
import TreeDepartment from "../department/component/TreeDepartment";
import { DepartmentResponse } from "model/account/department.model";
import { departmentDetailAction } from "domain/actions/account/department.action";
import { showSuccess } from "utils/ToastUtils";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { Map } from "component/ggmap";
import copy from "copy-to-clipboard";
import "./styles.scss";

const { Item } = Form;
const { Option } = Select;

const DefaultLocation = { lat: 21.0228161, lng: 105.8019439 };
const API_KEY = "AIzaSyB6sGeWZ-0xWzRNGK0eCCdZW1CtzYTfJ0g";

type StoreParam = {
  id: string;
};

const DefaultCountry = 233;

const StoreUpdateScreen: React.FC = () => {
  const { id } = useParams<StoreParam>();
  const idNumber = parseInt(id);
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //State
  const [formMain] = Form.useForm();
  const [data, setData] = useState<StoreResponse | null>(null);
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<DistrictResponse>>([]);
  const [wards, setWards] = useState<Array<WardResponse>>([]);
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [type, setType] = useState<Array<StoreTypeRequest>>([]);
  const [lstDepartment, setLstDepartment] = useState<Array<DepartmentResponse>>();
  const firstload = useRef(true);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [dataOrigin, setDataOrigin] = useState<StoreUpdateRequest | null>(null);
  const [defaultLocation] = useState(DefaultLocation);
  const [location, setLocation] = useState(defaultLocation);
  const [statusStore, setStatusStore] = useState("active");
  const [isSaleable, setIsSaleable] = useState("active");
  const [isStocktaking, setIsStocktaking] = useState("inactive");

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
        formMain.setFieldsValue({
          city_id: cityId,
          ward_id: "",
        });
      }
      dispatch(WardGetByDistrictAction(value, setWards));
    },
    [cityViews, dispatch, formMain],
  );
  const onUpdateSuccess = useCallback(() => {
    setLoading(false);
    history.push(`${UrlConfig.STORE}/${idNumber}`);
    showSuccess("Lưu dữ liệu thành công");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
  const onFinish = useCallback(
    (values: StoreUpdateRequest) => {
      setLoading(true);
      let newData: any = { ...values };
      const coordinates = newData.coordinates?.replaceAll(" ", "").split(",");

      newData = {
        ...newData,
        status: statusStore,
        is_saleable: isSaleable === "active",
        is_stocktaking: isStocktaking === "active",
        latitude: coordinates.length > 0 ? coordinates[0] : "",
        longitude: coordinates.length > 0 ? coordinates[1] : "",
      };

      delete newData.coordinates;
      delete newData.iframe;

      dispatch(StoreUpdateAction(idNumber, newData, onUpdateSuccess));
    },
    [dispatch, idNumber, isSaleable, isStocktaking, onUpdateSuccess, statusStore],
  );
  const setResult = useCallback((data: StoreResponse | false) => {
    setLoadingData(false);
    if (!data) {
      setError(false);
    } else {
      let newData: any = { ...data };

      setIsSaleable(newData.is_saleable ? 'active' : 'inactive')
      setIsStocktaking(newData.is_stocktaking ? "active" : "inactive");
      setStatusStore(newData.status);

      if (data.latitude && data.longitude && data.latitude !== '' && data.longitude !== '') {
        newData.coordinates = `${data.latitude}, ${data.longitude}`;
        newData.iframe = `<iframe width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={\`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${data.latitude},${data.longitude}\`} />`;
      }

      setData(newData);
      formMain.setFieldsValue(newData);
      setDataOrigin(formMain.getFieldsValue());
    }
  }, [formMain]);

  const backAction = () => {
    if (JSON.stringify(formMain.getFieldsValue()) !== JSON.stringify(dataOrigin)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({ visible: false });
        },
        onOk: () => {
          setModalConfirm({ visible: false });
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
      });
    } else {
      history.goBack();
    }
  };

  const onResult = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (data) {
    }
  }, []);

  const onResDepartment = useCallback((data: any) => {
    if (data) {
      setLstDepartment(data);
    }
  }, []);

  useEffect(() => {
    if (firstload.current) {
      setLoadingData(true);
      dispatch(CountryGetAllAction(setCountries));
      dispatch(DistrictGetByCountryAction(DefaultCountry, setCityView));
      dispatch(StoreRankAction(setStoreRank));
      dispatch(StoreGetTypeAction(setType));
      if (!Number.isNaN(idNumber)) {
        dispatch(StoreDetailAction(idNumber, setResult));
      }
      dispatch(
        AccountSearchAction(
          { department_ids: [AppConfig.WM_DEPARTMENT], status: "active" },
          onResult,
        ),
      );
      dispatch(
        departmentDetailAction(
          AppConfig.BUSINESS_DEPARTMENT ? AppConfig.BUSINESS_DEPARTMENT : "",
          onResDepartment,
        ),
      );
    }
    firstload.current = true;
  }, [dispatch, idNumber, setResult, onResult, onResDepartment]);

  useEffect(() => {
    if (data !== null) {
      dispatch(WardGetByDistrictAction(data.district_id, setWards));
    }
  }, [data, dispatch]);

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

  const selectPlace = (e: any) => {
    const newLocation = JSON.parse(e?.value);

    const iframe = `<iframe width="600" height="450" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={\`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${newLocation.lat},${newLocation.lng}\`} />`;

    setLocation({ ...newLocation });

    formMain.setFieldsValue({
      coordinates: `${newLocation.lat}, ${newLocation.lng}`,
      link_google_map: `https://www.google.com/maps/search/?api=1&query=${newLocation.lat},${newLocation.lng}`,
      iframe,
    });
  };

  const copyCode = () => {
    copy(formMain.getFieldValue("iframe"));
    showSuccess("Đã sao chép!");
  };

  return (
    <ContentContainer
      title={`Sửa cửa hàng ${data?.name}`}
      isError={isError}
      isLoading={loadingData}
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
          name: "Sửa cửa hàng",
        },
      ]}
    >
      {data !== null && (
        <Form form={formMain} layout="vertical" initialValues={data} onFinish={onFinish}>
          <Row gutter={20} className="store-detail-screen">
            <Col span={18}>
              <Card
                title="Thông tin cửa hàng"
              >
                <Row gutter={50}>
                  <Item hidden noStyle name="version">
                    <Input />
                  </Item>
                  <Col span={24} lg={8} md={12} sm={24}>
                    <Item
                      normalize={value => value.trimStart()}
                      rules={[
                        { required: true, message: "Vui lòng nhập tên cửa hàng" },
                        { max: 255, message: "Tên cửa hàng không quá 255 kí tự" },
                        {
                          pattern: RegUtil.STRINGUTF8,
                          message: "Tên danh mục không gồm kí tự đặc biệt",
                        },
                      ]}
                      label="Tên cửa hàng"
                      name="name"
                    >
                      <Input
                        onChange={(e) => {
                          dispatch(
                            StoreValidateAction(
                              { id: idNumber, name: e.target.value },
                              (data) => {
                                if (data instanceof Array) {
                                  formMain.setFields([
                                    {
                                      validating: false,
                                      name: "name",
                                      errors: data,
                                    },
                                  ]);
                                }
                              },
                            ),
                          );
                        }}
                        maxLength={255}
                        placeholder="Nhập tên cửa hàng"
                      />
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
                      label="Số điện thoại"
                      name="hotline"
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
                      rules={[{ required: true, message: "Vui lòng chọn loại cửa hàng" }]}
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
                      rules={[{ required: true, message: "Vui lòng chọn phòng ban tương ứng" }]}
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
                    <Item
                      name="reference_id"
                      label="Mã tham chiếu"
                    >
                      <InputNumber style={{ width: "100%" }} maxLength={10} placeholder="Nhập mã tham chiếu" />
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
                    <div className="status-info">
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
                        if (!e) setIsSaleable("inactive");
                      }} /></div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <div className="status-info">
                      <div>Cho phép bán:</div>
                      <div className="right"><Switch checked={isSaleable === "active"} onChange={(e) => {
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
                      label="Phân cấp"
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
                        { required: true, message: "Vui lòng nhập diện tích cửa hàng" },
                      ]}
                    >
                      <Input placeholder="Nhập diện tích cửa hàng" />
                    </Item>
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col span={24}>
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
            back={"Quay lại"}
            backAction={backAction}
            rightComponent={
              <Space>
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </Space>
            }
          />
        </Form>
      )}
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default StoreUpdateScreen;
