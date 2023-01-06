import { DeleteOutlined, EyeInvisibleOutlined, EyeTwoTone, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  TreeSelect,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
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
import { AccountRequest, AccountResponse } from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { CountryResponse } from "model/content/country.model";
import { CityView, DistrictResponse } from "model/content/district.model";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import TreeStore from "component/TreeStore";
import { convertDistrict } from "utils/AppUtils";
import { RegUtil } from "utils/RegUtils";
import { showSuccess } from "utils/ToastUtils";
import TreeDepartment from "../department/component/TreeDepartment";
import { PASSWORD_RULES } from "./account.rules";
import { SupplierGetAllNoPagingAction } from "domain/actions/core/supplier.action";
import { ProcurementField } from "model/procurement/field";
import { AiOutlinePlusCircle } from "react-icons/ai";
import SupplierItem from "../../purchase-order/component/supplier-item";
import "./styles.scss";
import { fullTextSearch } from "utils/StringUtils";

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
  account_jobs: [{}],
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
  const [formRef] = Form.useForm();
  const history = useHistory();

  const listAccountStatus = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.account_status,
  );
  const listGender = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.gender);
  //State
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [statusSupplier, setStatusSupplier] = useState<string>(initRequest.status);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listRole, setRole] = useState<Array<RoleResponse>>();
  const [listDepartmentTree, setDepartmentTree] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();

  const [isSupplier, setIsSupplier] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);

  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);

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
      formRef?.setFieldsValue({
        status: checked ? "active" : "inactive",
      });
    },
    [formRef],
  );

  const onChangeStatusSupplier = useCallback(
    (checked: boolean) => {
      setStatusSupplier(checked ? "active" : "inactive");
      formRef?.setFieldsValue({
        supplier_status: checked ? "active" : "inactive",
      });
    },
    [formRef],
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
        formRef?.setFieldsValue({
          city_id: cityId,
        });
      }
    },
    [cityViews, formRef],
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
    [history],
  );

  const onFinish = useCallback(
    (value: AccountRequest) => {
      let newData: any = { ...value };
      if (isSupplier) {
        newData.user_name = `NCC1`;
        newData.code = `NCC1`;
        newData.gender = "male";

        const ids = newData.supplier;
        const indexOfAll = ids.filter((i: any) => !i);

        newData.supplier_ids =
          indexOfAll.length > 0
            ? data.map((i: any) => i.id).filter((i: any) => i !== null)
            : ids.filter((i: any) => i !== null);
      }
      newData = {
        ...newData,
        supplier_status: statusSupplier,
        is_supplier: isSupplier,
      };
      delete newData.supplier;
      dispatch(AccountCreateAction(newData, onCreateSuccess));
      setLoadingSaveButton(true);
    },
    [data, dispatch, isSupplier, onCreateSuccess, statusSupplier],
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

  const statusSupplierValue = useMemo(() => {
    if (!listAccountStatus) {
      return "";
    }
    let index = listAccountStatus.findIndex((item) => item.value === statusSupplier);
    if (index !== -1) {
      return listAccountStatus[index].name;
    }
    return "";
  }, [statusSupplier, listAccountStatus]);

  // const selectAllStore = useMemo(() => {
  //   return listStore?.map((item) => item.id);
  // }, [listStore]);
  //end memo

  const backAction = () => {
    setModalConfirm({
      visible: true,
      onCancel: () => {
        setModalConfirm({ visible: false });
      },
      onOk: () => {
        history.push(UrlConfig.ACCOUNTS);
      },
      title: "Bạn có muốn quay lại?",
      subTitle: "Sau khi quay lại thay đổi sẽ không được lưu.",
    });
  };

  useEffect(() => {
    dispatch(
      DepartmentGetListAction((result) => {
        if (result) {
          setDepartmentTree(result);
        }
      }),
    );
    dispatch(PositionGetListAction(setPosition));
    dispatch(RoleGetListAction(initRoleQuery, setRole));
    dispatch(StoreGetListAction(setStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict));
  }, [dispatch, setDataDistrict]);

  const onResult = useCallback((result: any) => {
    setData([
      {
        id: null,
        name: "Tất cả",
      },
      ...result,
    ]);
  }, []);

  useEffect(() => {
    dispatch(SupplierGetAllNoPagingAction(onResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tagRender = (props: any) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label.props?.children ? label.props?.children : label.props?.data?.name}
      </Tag>
    );
  };

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
        form={formRef}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ...initRequest,
          store_ids: [],
        }}
        scrollToFirstError
      >
        <Card
          title="Thông tin người dùng"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái Unicorn</label>
              <Switch onChange={onChangeStatus} className="ant-switch-success" defaultChecked />
              <label
                className={status === "active" ? "text-success" : "text-error"}
                style={{
                  display: "inline-block",
                  minWidth: "110px",
                }}
              >
                {statusValue}
              </label>
              <label className="text-default">Trạng thái Supplier</label>
              <Switch
                onChange={onChangeStatusSupplier}
                className="ant-switch-success"
                defaultChecked
              />
              <label
                className={statusSupplier === "active" ? "text-success" : "text-error"}
                style={{
                  display: "inline-block",
                  minWidth: "110px",
                }}
              >
                {statusSupplierValue}
              </label>
              <Item noStyle name="status" hidden>
                <Input value={status} />
              </Item>
            </Space>
          }
        >
          <Row className="mb-20">
            <div className="display-flex align-item">
              <Checkbox
                checked={isSupplier}
                onChange={() => setIsSupplier(!isSupplier)}
                className="mr-15"
              />
              <div>Nhà cung cấp</div>
            </div>
          </Row>
          {!isSupplier && (
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  label="Mã nhân viên"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã nhân viên" },
                    {
                      message: "Mã nhân viên không đúng định dạng",
                      pattern: RegUtil.BOTH_NUMBER_AND_STRING,
                    },
                  ]}
                  normalize={(value: string) => (value || "").toUpperCase()}
                >
                  <Input
                    className="r-5"
                    placeholder="VD: YD0000"
                    size="large"
                    onChange={(e) =>
                      formRef?.setFieldsValue({
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
          )}
          <Row gutter={24}>
            {!isSupplier && (
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  label="Tên đăng nhập"
                  name="user_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                >
                  <Input className="r-5" placeholder="Nhập tên đăng nhập" size="large" disabled />
                </Item>
              </Col>
            )}
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
                rules={[...PASSWORD_RULES, { required: true, message: "Vui lòng nhập mật khẩu" }]}
                name="password"
                label="Mật khẩu"
              >
                <Input.Password
                  autoComplete="new-password"
                  className="r-5"
                  placeholder="Nhập mật khẩu"
                  size="large"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                label="Nhà cung cấp"
                name={[ProcurementField.supplier]}
                rules={[
                  {
                    required: isSupplier,
                    message: "Vui lòng chọn nhà cung cấp",
                  },
                ]}
              >
                <Select
                  autoClearSearchValue={false}
                  placeholder="Tìm kiếm và chọn nhà cung cấp"
                  mode="multiple"
                  tagRender={tagRender}
                  maxTagCount="responsive"
                  notFoundContent="Không có dữ liệu"
                  showSearch
                  filterOption={(input, option: any) => {
                    return (
                      option?.key.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0 ||
                      fullTextSearch(input, option?.key) ||
                      option?.key === ""
                    );
                  }}
                  dropdownRender={(menu) => {
                    return (
                      <div className="dropdown-custom">
                        <Button
                          icon={<AiOutlinePlusCircle size={24} />}
                          className="dropdown-custom-add-new"
                          type="link"
                          onClick={() => window.open(`${process.env.PUBLIC_URL}/suppliers/create`)}
                        >
                          Thêm mới nhà cung cấp
                        </Button>
                        {menu}
                      </div>
                    );
                  }}
                >
                  {data.map((supplier: any) => {
                    return (
                      <Option
                        key={
                          supplier.id
                            ? `${supplier.id}-${supplier.name}-${supplier.code}-${
                                supplier.phone
                              }-${supplier.contacts.map((i: any) => i.phone).join(",")}`
                            : ""
                        }
                        value={supplier.id}
                      >
                        {supplier.id ? (
                          <SupplierItem data={supplier} key={supplier.id?.toString()} />
                        ) : (
                          <div className="item-all">{supplier.name}</div>
                        )}
                      </Option>
                    );
                  })}
                </Select>
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
                <TreeStore
                  placeholder="Chọn cửa hàng"
                  storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                  style={{ width: "100%" }}
                />
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
                  autoClearSearchValue={false}
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
                  autoClearSearchValue={false}
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

        <Card title="Thông tin công việc" bodyStyle={{ padding: 0 }}>
          <div className="padding-20">
            <List name="account_jobs">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey }) => (
                    <Row key={key} gutter={16}>
                      <Item
                        hidden
                        noStyle
                        label="Phòng ban"
                        name={[name, "id"]}
                        fieldKey={[fieldKey, "id"]}
                      >
                        <Input hidden />
                      </Item>
                      <Item
                        hidden
                        noStyle
                        label="Phòng ban"
                        name={[name, "code"]}
                        fieldKey={[fieldKey, "code"]}
                      >
                        <Input hidden />
                      </Item>
                      <Item
                        hidden
                        noStyle
                        label="Phòng ban"
                        name={[name, "account_id"]}
                        fieldKey={[fieldKey, "account_id"]}
                      >
                        <Input hidden />
                      </Item>
                      <Col md={8}>
                        <Item
                          label="Phòng ban"
                          name={[name, "department_id"]}
                          fieldKey={[fieldKey, "department_id"]}
                          rules={[{ required: true, message: "Vui lòng chọn bộ phận" }]}
                        >
                          <TreeSelect
                            placeholder="Chọn phòng ban"
                            treeDefaultExpandAll
                            className="selector"
                            allowClear
                            showSearch
                            treeNodeFilterProp="title"
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
                            autoClearSearchValue={false}
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
                          <Button onClick={() => remove(name)} icon={<DeleteOutlined />} />
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
        </Card>
        <BottomBarContainer
          back="Quay lại trang danh sách"
          backAction={backAction}
          rightComponent={
            allowCreateAcc && (
              <Button htmlType="submit" type="primary" loading={loadingSaveButton}>
                Tạo người dùng
              </Button>
            )
          }
        />
      </Form>
      <ModalConfirm
        onCancel={() => {
          setIsShowModalConfirm(false);
        }}
        onOk={() => {
          history.push(UrlConfig.ACCOUNTS);
        }}
        visible={isShowModalConfirm}
      />
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

export default AccountCreateScreen;
