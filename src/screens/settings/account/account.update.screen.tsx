import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Skeleton,
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
  AccountGetByCodeAction,
  AccountUpdateAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import { RoleGetListAction } from "domain/actions/auth/role.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { SupplierGetAllNoPagingAction } from "domain/actions/core/supplier.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useAuthorization from "hook/useAuthorization";
import { AccountRequest, AccountResponse } from "model/account/account.model";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { CountryResponse } from "model/content/country.model";
import { CityView, DistrictResponse } from "model/content/district.model";
import { SupplierResponse } from "model/core/supplier.model";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import TreeStore from "component/TreeStore";
import { convertDistrict } from "utils/AppUtils";
import { CompareObject } from "utils/CompareObject";
import { RegUtil } from "utils/RegUtils";
import { fullTextSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ProcurementField } from "../../../model/procurement/field";
import SupplierItem from "../../purchase-order/component/supplier-item";
import "./styles.scss";

const { Item } = Form;
const { Option, OptGroup } = Select;

const DefaultCountry = 233;

const initRoleQuery: RoleSearchQuery = {
  page: 1,
  limit: 200,
};
type AccountParam = {
  code: string;
};

const AccountUpdateScreen: React.FC = () => {
  const { code: userCode } = useParams<AccountParam>();

  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();

  const listAccountStatus = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.account_status,
  );
  const listGender = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.gender);
  const accountId = useRef<number>(0);

  //State
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>();
  const [statusSupplier, setStatusSupplier] = useState<string>();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listRole, setRole] = useState<Array<RoleResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [accountDetail, setAccountDetail] = useState<AccountResponse>();
  const [listDepartmentTree, setDepartmentTree] = useState<Array<DepartmentResponse>>();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const [data, setData] = useState<any>([]);
  const [isSupplier, setIsSupplier] = useState<boolean | undefined>(false);
  //EndState

  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });

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
    [formRef],
  );

  const onChangeStatusSupplier = useCallback(
    (checked: boolean) => {
      setStatusSupplier(checked ? "active" : "inactive");
      formRef.current?.setFieldsValue({
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
        formRef.current?.setFieldsValue({
          city_id: cityId,
        });
      }
    },
    [cityViews, formRef],
  );

  const onUpdateSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Cập nhật thành công");
    history.push(UrlConfig.ACCOUNTS + "/" + userCode);
  }, [history, userCode, dispatch]);

  const onFinish = useCallback(
    (account: AccountRequest) => {
      if (accountId.current) {
        let accountRequest: AccountRequest = { ...account };
        if (isSupplier) {
          accountRequest.user_name = `NCC1`;
          accountRequest.code = `NCC1`;
          accountRequest.gender = "male";

          const supplierIds = accountRequest.supplier;
          const isSelectAllSuppliers = supplierIds.some(
            (supplierId: number) => supplierId === null,
          );

          accountRequest.supplier_ids = isSelectAllSuppliers
            ? data
                .map((supplier: SupplierResponse) => supplier.id)
                .filter((supplierId: number) => supplierId !== null)
            : supplierIds.filter((id: number) => id !== null);
        }
        accountRequest = {
          ...accountRequest,
          supplier_status: statusSupplier,
          is_supplier: isSupplier,
        };
        delete accountRequest.supplier;
        dispatch(showLoading());
        dispatch(AccountUpdateAction(accountId.current, accountRequest, onUpdateSuccess));
      }
    },
    [data, dispatch, isSupplier, onUpdateSuccess, statusSupplier],
  );
  const setAccount = useCallback((data: AccountResponse) => {
    let ids: Array<number> = [];
    data.account_stores.forEach((accountStore) => {
      if (accountStore && accountStore.store_id) {
        ids.push(accountStore.store_id);
      }
    });
    data.store_ids = [...ids];
    setStatus(data.status);
    setStatusSupplier(data.supplier_status);
    setIsSupplier(data.is_supplier);

    setAccountDetail({
      ...data,
      supplier: data.account_suppliers.map((i: any) => i.supplier_id),
    });
    accountId.current = data.id;
  }, []);
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
  //end memo

  const backAction = () => {
    if (!CompareObject(formRef.current?.getFieldsValue(), accountDetail)) {
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
    dispatch(AccountGetByCodeAction(userCode, setAccount));
  }, [dispatch, setDataDistrict, userCode, setAccount]);

  if (accountDetail == null) {
    return (
      <ContentContainer
        title="Sửa người dùng"
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
            name: "Sửa người dùng",
          },
        ]}
      >
        <Card>
          <Skeleton loading={true} />
        </Card>
      </ContentContainer>
    );
  }
  return (
    <ContentContainer
      title="Sửa người dùng"
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
          name: "Sửa người dùng",
        },
      ]}
    >
      <Form ref={formRef} layout="vertical" onFinish={onFinish} initialValues={accountDetail}>
        <Card
          title="Thông tin cơ bản"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái Unicorn</label>
              <Switch
                onChange={onChangeStatus}
                className="ant-switch-success"
                checked={status === "active"}
              />
              <label className={status === "active" ? "text-success" : "text-error"}>
                {statusValue}
              </label>
              <Item noStyle name="status" hidden>
                <Input value={status} />
              </Item>

              <label className="text-default">Trạng thái Supplier</label>
              <Switch
                onChange={onChangeStatusSupplier}
                className="ant-switch-success"
                checked={statusSupplier === "active"}
              />
              <label className={statusSupplier === "active" ? "text-success" : "text-error"}>
                {statusSupplierValue}
              </label>
              <Item noStyle name="supplier_status" hidden>
                <Input value={statusSupplier} />
              </Item>
            </Space>
          }
        >
          <Item noStyle name="version" hidden>
            <Input />
          </Item>
          {!isSupplier && (
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Tên đăng nhập"
                name="user_name"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                hidden
              >
                <Input className="r-5" placeholder="Nhập tên đăng nhập" size="large" disabled />
              </Item>
            </Col>
          )}
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
                  rules={[{ required: true, message: "Vui lòng nhập mã nhân viên" }]}
                  normalize={(value: string) => (value || "").toUpperCase()}
                >
                  <Input
                    className="r-5"
                    placeholder="VD: YD0000"
                    size="large"
                    disabled
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
                  <Radio.Group className="ip-radio">
                    {listGender?.map((item) => (
                      <Radio className="ip-radio-item" value={item.value} key={item.value}>
                        {item.name}
                      </Radio>
                    ))}
                  </Radio.Group>
                </Item>
              </Col>
            </Row>
          )}
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Họ và tên"
                name="full_name"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input className="r-5" placeholder="Nhập họ và tên" size="large" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  // { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: RegUtil.PHONE,
                    message: "Số điện thoại không đúng định dạng",
                  },
                ]}
              >
                <Input className="r-5" placeholder="Nhập số điện thoại" size="large" />
              </Item>
            </Col>
          </Row>
          <Row gutter={24}>
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
                  placeholder="Chọn nhóm quyền"
                  className="selector"
                  allowClear
                  showArrow
                  showSearch
                  optionFilterProp="children"
                  maxTagCount="responsive"
                >
                  {listRole?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
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
                    return fullTextSearch(input, option?.key || "");
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
                label="Ngày sinh"
                name="birthday"
                // rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
              >
                <CustomDatepicker style={{ width: "100%" }} placeholder="20/01/2021" />
              </Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item name="store_ids" style={{ minWidth: 220 }} label="Chọn cửa hàng">
                <TreeStore
                  placeholder="Chọn cửa hàng"
                  storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Thông tin khác</Divider>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Item label="Quốc gia" name="country_id">
                <Select disabled className="selector" placeholder="Chọn quốc gia">
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
                  optionFilterProp="children"
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
            <Form.List
              name="account_jobs"
              rules={[
                {
                  validator: (rule, value, callback) => {
                    if (value.length === 0) {
                      showError("Vui lòng chọn công việc");
                      callback("Vui lòng chọn công việc");
                    } else {
                      callback();
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey }) => (
                    <Row key={key} gutter={16}>
                      <Item hidden noStyle name={[name, "id"]} fieldKey={[fieldKey, "id"]}>
                        <Input hidden />
                      </Item>
                      <Item hidden noStyle name={[name, "code"]} fieldKey={[fieldKey, "code"]}>
                        <Input hidden />
                      </Item>
                      <Item
                        hidden
                        noStyle
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
            </Form.List>
          </div>
        </Card>

        <BottomBarContainer
          back="Quay lại"
          backAction={backAction}
          rightComponent={
            <Space>
              {allowUpdateAcc ? (
                <Button htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              ) : null}
            </Space>
          }
        />
      </Form>
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
};

const TreeDepartment = (item: DepartmentResponse) => {
  return (
    <TreeSelect.TreeNode value={item.id} title={item.name}>
      {item.children.length > 0 && (
        <React.Fragment>
          {item.children.map((item, index) => (
            <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </TreeSelect.TreeNode>
  );
};

export default AccountUpdateScreen;
