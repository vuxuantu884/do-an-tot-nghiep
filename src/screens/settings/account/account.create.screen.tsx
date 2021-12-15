import {
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  TreeSelect
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import { AccountPermissions } from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  AccountCreateAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import { RoleGetListAction } from "domain/actions/auth/role.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import useAuthorization from "hook/useAuthorization";
import {
  AccountRequest,
  AccountResponse,
} from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { CountryResponse } from "model/content/country.model";
import { CityView, DistrictResponse } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { convertDistrict } from "utils/AppUtils";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import TreeDepartment from "../department/component/TreeDepartment";
import { PASSWORD_RULES } from "./account.rules";
const { Item, List } = Form;
const { Option, OptGroup } = Select;

const DefaultCountry = 233;
const initRequest = {
  code: "",
  user_id: "",
  user_name: "",
  gender: "",
  full_name: "",
  phone: "",
  account_stores: [],
  account_jobs: [],
  address: "",
  status: "active",
  password: "",
  country_id: 233,
};

const initRoleQuery: RoleSearchQuery = {
  page: 1,
  limit: 200,
};

const AccountCreateScreen: React.FC = () => {
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();

  const listAccountStatus = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.account_status
  );
  const listGender = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.gender
  );
  //State
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listRole, setRole] = useState<Array<RoleResponse>>();
  const [listDepartmentTree, setDepartmentTree] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [isSelectAllStore, setIsSelectAllStore] = useState(false);

  const allowCreateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.CREATE],
  });
  //EndState
  //Callback

  const setDataDistrict = useCallback((data: Array<DistrictResponse>) => {
    let cityViews: Array<CityView> = convertDistrict(data);
    setCityView(cityViews);
  }, []);
  const onChangeStatus = useCallback(
    (checked: boolean) => {
      setStatus(checked ? "active" : "inactive");
      formRef.current?.setFieldsValue({
        status: checked ? "active" : "inactive",
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
  const onCreateSuccess = useCallback(
    (result: AccountResponse) => {
      if (result) {
        history.push(`${UrlConfig.ACCOUNTS}/${result.code}`);
        showSuccess("Thêm mới dữ liệu thành công");
      } else {
        setLoadingSaveButton(false);
      }
    },
    [history]
  );
 
  const onFinish = useCallback(
    (value: AccountRequest) => {
      dispatch(AccountCreateAction(value, onCreateSuccess));
      setLoadingSaveButton(true);
    },
    [dispatch, onCreateSuccess]
  );
  //End callback
  //Memo
  const statusValue = useMemo(() => {
    if (!listAccountStatus) {
      return "";
    }
    let index = listAccountStatus.findIndex((item) => item.value === status);
    if (index !== -1) {
      return listAccountStatus[index].name;
    }
    return "";
  }, [status, listAccountStatus]);

  const selectAllStore = useMemo(() => {
    return listStore?.map((item) => item.id);
  }, [listStore]);
  //end memo

  useEffect(() => {
    dispatch(
      DepartmentGetListAction((result) => {
        if (result) {
          setDepartmentTree(result);
        }
      })
    );
    dispatch(PositionGetListAction(setPosition));
    dispatch(RoleGetListAction(initRoleQuery, setRole));
    dispatch(StoreGetListAction(setStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict));
  }, [dispatch, setDataDistrict]);
  return (
    <ContentContainer
      title="Thêm mới người dùng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý người dùng",
          path: UrlConfig.ACCOUNTS,
        },
        {
          name: "Thêm mới người dùng",
        },
      ]}
    >
      <Form
        ref={formRef}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initRequest}
        scrollToFirstError
      >
        <Card
          title="Thông tin người dùng"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái</label>
              <Switch
                onChange={onChangeStatus}
                className="ant-switch-success"
                defaultChecked
              />
              <label className={status === "active" ? "text-success" : "text-error"}>
                {statusValue}
              </label>
              <Item noStyle name="status" hidden>
                <Input value={status} />
              </Item>
            </Space>
          }
        >
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Mã nhân viên"
                name="code"
                rules={[{ required: true, message: "Vui lòng nhập mã nhân viên" }]}
                normalize={(value: string) => (value || "").toUpperCase()}
              >
                <Input
                  className="r-5"
                  placeholder="VD: YD0000"
                  size="large"
                  onChange={(e) =>
                    formRef.current?.setFieldsValue({
                      user_name: e.target.value.toUpperCase(),
                    })
                  }
                  autoComplete="new-password"
                />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                name="gender"
                label="Giới tính"
              >
                <Radio.Group>
                  {listGender?.map((item) => (
                    <Radio value={item.value} key={item.value}>
                      {item.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Tên đăng nhập"
                name="user_name"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
              >
                <Input
                  className="r-5"
                  placeholder="Nhập tên đăng nhập"
                  size="large"
                  disabled
                />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input className="r-5" placeholder="Nhập họ và tên" size="large" />
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                rules={[
                  ...PASSWORD_RULES,
                  { required: true, message: "Vui lòng nhập tên đăng nhập" },
                ]}
                name="password"
                label="Mật khẩu"
              >
                <Input.Password
                  autoComplete="new-password"
                  className="r-5"
                  placeholder="Nhập mật khẩu"
                  size="large"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="confirm"
                label="Nhập lại mật khẩu"
                dependencies={["password"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("Nhập lại mật khẩu không đúng"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: RegUtil.PHONE,
                    message: "Số điện thoại không đúng định dạng",
                  },
                ]}
              >
                <Input className="r-5" placeholder="Nhập số điện thoại" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item name="store_ids" label="Cửa hàng">
                <Select
                  placeholder="Chọn cửa hàng"
                  allowClear
                  showArrow
                  maxTagCount={"responsive" as const}
                  mode={isSelectAllStore ? "tags" : "multiple"}
                  optionFilterProp="children"
                  onChange={(value: any) => {
                    if (
                      (Array.isArray(value) && value.includes("all")) ||
                      value === "all"
                    ) {
                      if (isSelectAllStore) {
                        formRef.current?.setFieldsValue({ store_ids: [] });
                        setIsSelectAllStore(false);
                      } else {
                        formRef.current?.setFieldsValue({
                          store_ids: selectAllStore,
                        });
                        setIsSelectAllStore(true);
                      }
                    } else {
                      setIsSelectAllStore(false);
                    }
                  }}
                >
                  <Option value={"all"}>
                    {isSelectAllStore ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Option>
                  {listStore?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item label="Ngày sinh" name="birthday">
                <CustomDatepicker style={{ width: "100%" }} placeholder="20/01/2021" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                name="role_id"
                label="Nhóm phân quyền"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nhóm phân quyền",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn vị trí"
                  allowClear
                  showArrow
                  showSearch
                  optionFilterProp="children"
                >
                  {listRole?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">Thông tin khác</Divider>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item label="Quốc gia" name="country_id">
                <Select disabled placeholder="Chọn quốc gia">
                  {listCountries?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item label="Khu vực" name="district_id">
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
              </Item>
              <Item hidden name="city_id">
                <Input />
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={16} md={24} sm={24}>
              <Item label="Địa chỉ" name="address">
                <Input className="r-5" placeholder="Địa chỉ" size="large" />
              </Item>
            </Col>
          </Row>
        </Card>

        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Thông tin công việc">
            <div className="padding-20">
              <List name="account_jobs">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                      <Row key={key} gutter={16}>
                        <Item
                          hidden
                          noStyle
                          label="Bộ phận"
                          name={[name, "id"]}
                          fieldKey={[fieldKey, "id"]}
                        >
                          <Input hidden />
                        </Item>
                        <Item
                          hidden
                          noStyle
                          label="Bộ phận"
                          name={[name, "code"]}
                          fieldKey={[fieldKey, "code"]}
                        >
                          <Input hidden />
                        </Item>
                        <Item
                          hidden
                          noStyle
                          label="Bộ phận"
                          name={[name, "account_id"]}
                          fieldKey={[fieldKey, "account_id"]}
                        >
                          <Input hidden />
                        </Item>
                        <Col md={8}>
                          <Item
                            label="Bộ phận"
                            name={[name, "department_id"]}
                            fieldKey={[fieldKey, "department_id"]}
                          >
                            <TreeSelect
                              placeholder="Chọn bộ phận"
                              treeDefaultExpandAll
                              className="selector"
                              allowClear
                              showSearch
                              treeNodeFilterProp='title'
                            >
                              {listDepartmentTree?.map((item, index) => (
                                <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
                              ))}
                            </TreeSelect>
                          </Item>
                        </Col>
                        <Col md={8}>
                          <Item
                            name={[name, "position_id"]}
                            fieldKey={[fieldKey, "position_id"]}
                            label="Vị trí"
                          >
                            <Select
                              placeholder="Chọn vị trí"
                              allowClear
                              showArrow
                              showSearch
                              optionFilterProp="children"
                              style={{ width: "100%" }}
                            >
                              {listPosition?.map((item) => (
                                <Option key={item.id} value={item.id}>
                                  {item.name}
                                </Option>
                              ))}
                            </Select>
                          </Item>
                        </Col>
                        {fields.length > 1 && (
                          <Col md={4} style={{ display: "flex", alignItems: "center" }}>
                            <Button
                              onClick={() => remove(name)}
                              icon={<DeleteOutlined />}
                            />
                          </Col>
                        )}
                      </Row>
                    ))}
                    <Button
                      type="link"
                      className="padding-0"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Thêm mới
                    </Button>
                  </>
                )}
              </List>
            </div>
          </Collapse.Panel>
        </Collapse>
        <BottomBarContainer
          back="Quay lại"
          rightComponent={
            allowCreateAcc &&
            <Button htmlType="submit" type="primary" loading={loadingSaveButton}>
              Tạo người dùng
            </Button>
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default AccountCreateScreen;
