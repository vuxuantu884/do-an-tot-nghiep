import {EyeInvisibleOutlined, EyeTwoTone, PlusOutlined} from "@ant-design/icons";
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
  Table,
  TreeSelect
} from "antd";
import deleteIcon from "assets/icon/delete.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomDatepicker from "component/custom/date-picker.custom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import {AccountPermissions} from "config/permissions/account.permisssion";
import UrlConfig from "config/url.config";
import {
  AccountGetByCodeAction,
  AccountUpdateAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import {RoleGetListAction} from "domain/actions/auth/role.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import {StoreGetListAction} from "domain/actions/core/store.action";
import useAuthorization from "hook/useAuthorization";
import {
  AccountJobReQuest,
  AccountJobResponse,
  AccountRequest,
  AccountResponse,
  AccountStoreResponse,
  AccountView,
} from "model/account/account.model";
import {DepartmentResponse, DepartmentView} from "model/account/department.model";
import {PositionResponse} from "model/account/position.model";
import {RoleResponse, RoleSearchQuery} from "model/auth/roles.model";
import {CountryResponse} from "model/content/country.model";
import {CityView, DistrictResponse} from "model/content/district.model";
import {StoreResponse} from "model/core/store.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import moment from "moment";
import {RuleObject} from "rc-field-form/lib/interface";
import React, {createRef, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router";
import {useParams} from "react-router-dom";
import {convertDepartment, convertDistrict} from "utils/AppUtils";
import { CompareObject } from "utils/CompareObject";
import {RegUtil} from "utils/RegUtils";
import {PASSWORD_RULES} from "./account.rules";

const {Item} = Form;
const {Option, OptGroup} = Select;

const DefaultCountry = 233;

const initRoleQuery: RoleSearchQuery = {
  page: 1,
  limit: 200,
};
type AccountParam = {
  code: string;
};

const AccountUpdateScreen: React.FC = () => {
  const {code: userCode} = useParams<AccountParam>();

  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const history = useHistory();

  const listAccountStatus = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.account_status
  );
  const listGender = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.gender
  );

  const listStoreRoot = useRef<Array<AccountStoreResponse>>();
  const idNumber = useRef<number>(0);

  //State
  const [listaccountJob, setAccountJob] = useState<Array<AccountJobReQuest>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>("active");
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listRole, setRole] = useState<Array<RoleResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [accountDetail, setAccountDetail] = useState<AccountView>();
  const [isSelectAllStore, setIsSelectAllStore] = useState(false); 
  const [listDepartmentTree, setDepartmentTree] = useState<Array<DepartmentResponse>>();
  const [listDepartment, setDepartment] = useState<Array<DepartmentView>>();
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });
  //EndState

  const allowUpdateAcc = useAuthorization({
    acceptPermissions: [AccountPermissions.UPDATE],
  });

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
  const addNewJob = () => {
    let listJob = [...listaccountJob];
    listJob.push({
      department_id: 0,
      position_id: 0,
      position_name: "",
      department_name: "",
      key: Number(moment().format("x")),
    });
    setAccountJob(listJob);
  };
  const onChangeDepartment = (e: any, key: number, jobId?: number) => {
    let listJob = [...listaccountJob];
    listJob[key].department_id = e;
    listJob[key].id = jobId;
    setAccountJob(listJob);
  };
  const onChangePosition = (e: any, key: number, jobId?: number) => {
    let listJob = [...listaccountJob];
    listJob[key].position_id = e;
    listJob[key].id = jobId;
    setAccountJob(listJob);
  };
  const onDeleteJob = (key: number) => {
    let listJob = [...listaccountJob];
    listJob.splice(key, 1);
    setAccountJob(listJob);
  };
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
  const onUpdateSuccess = useCallback(
    (data: AccountResponse) => {
      history.push(UrlConfig.ACCOUNTS + "/" + userCode);
    },
    [history, userCode]
  );
  const onFinish = useCallback(
    (values: AccountView) => {
      let accStores: Array<AccountStoreResponse> = [];
      let accJobs: Array<AccountJobResponse> = [];
      let listAccountSelected = [...listaccountJob];
      console.log(listAccountSelected);

      listStore?.forEach((el: StoreResponse) => {
        if (values.account_stores.includes(el.id)) {
          accStores.push({
            store_id: el.id,
            store: el.name,
          });
        }
      });

      listAccountSelected.forEach((el: AccountJobReQuest) => {
        if (el.department_id && el.position_id) {
          const department_name = listDepartment?.find(
            (item) => item.id === el.department_id
          )?.name;

          const position_name = listPosition?.find(
            (item) => item.id === el.position_id
          )?.name;

          accJobs.push({
            department_id: el.department_id,
            position_id: el.position_id,
            department_name,
            position_name,
          });
        }
      });

      let accountModel: AccountRequest = {
        full_name: values.full_name,
        gender: values.gender,
        user_name: values.user_name,
        code: values.code,
        password: values.password,
        birthday: values.birthday,
        account_stores: [...accStores],
        mobile: values.mobile,
        role_id: values.role_id,
        status: values.status,
        address: values.address,
        country_id: values.country_id,
        city_id: values.city_id,
        district_id: values.district_id,
        account_jobs: [...accJobs],
        version: values.version,
      };

      if (idNumber) {
        dispatch(AccountUpdateAction(idNumber.current, accountModel, onUpdateSuccess));
      }
    },
    [
      dispatch,
      idNumber,
      listaccountJob,
      onUpdateSuccess,
      listStore,
      listDepartment,
      listPosition,
    ]
  );
  const setAccount = useCallback((data: AccountResponse) => {
    let storeIds: Array<number> = [];
    listStoreRoot.current = data.account_stores;

    data.account_stores?.forEach((item) => {
      if (item.store_id) {
        storeIds.push(item.store_id);
      }
    });

    let jobs: Array<AccountJobReQuest> = [];
    data.account_jobs?.forEach((item, index) => {
      jobs.push({
        position_id: item.position_id,
        department_id: item.department_id,
        position_name: item.position_name || "",
        department_name: item.department_name || "",
        key: Number(moment().format("x")) + index,
      });
    });
    setAccountJob(jobs);

    let accountView: AccountView = {
      user_name: data.user_name,
      gender: data.gender,
      code: data.code,
      full_name: data.full_name,
      password: "",
      mobile: data.mobile,
      address: data.address,
      birthday: data.birthday,
      country_id: data.country_id,
      district_id: data.district_id,
      city_id: data.city_id,
      account_stores: storeIds,
      role_id: data.role_id,
      status: data.status,
      version: data.version,
      permissions: data.permissions,
    };
    idNumber.current = data.id;
    setStatus(accountView.status);
    setAccountDetail(accountView);
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

  const selectAllStore = useMemo(() => {
    return listStore?.map((item) => item.id);
  }, [listStore]);

  //end memo

  const columns = [
    {
      title: "Bộ phận",
      render: (text: string, item: AccountJobReQuest, index: number) => {
        return (
          <div>
            <TreeSelect
              style={{width: "100%"}}
               placeholder="Chọn bộ phận"
               treeDefaultExpandAll
               className="selector"
               onChange={(value) => onChangeDepartment(value, index)}
               allowClear
               showSearch
                defaultValue={item.department_id || undefined}
                treeNodeFilterProp='title'
             >
               {listDepartmentTree?.map((item, index) => (
                 <React.Fragment key={index}>{TreeDepartment(item)}</React.Fragment>
               ))}
             </TreeSelect>  
          </div>
        );
      },
    },
    {
      title: "Vị trí",
      render: (text: string, item: AccountJobReQuest, index: number) => {
        return (
          <div>
            <Select
              placeholder="Chọn bộ phận"
              className="selector"
              allowClear
              showArrow
              showSearch
              optionFilterProp="children"
              onChange={(value) => onChangePosition(value, index, item.id)}
              style={{width: "100%"}}
              defaultValue={item.position_id || undefined}
            >
              {listPosition?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </div>
        );
      },
    },
    {
      title: "",
      render: (text: string, item: AccountJobReQuest, index: number) => {
        return (
          <div>
            <Button
              type="text"
              className="p-0 yody-pos-delete-free-form"
              onClick={() => onDeleteJob(index)}
            >
              <img src={deleteIcon} alt="" />
            </Button>
          </div>
        );
      },
    },
  ];

  const backAction = ()=>{    
    delete accountDetail?.permissions;
    
    if (!CompareObject(formRef.current?.getFieldsValue(),accountDetail)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.goBack();
    }
  };

  useEffect(() => {
    setIsSelectAllStore(listStore?.length === accountDetail?.account_stores.length);
  }, [accountDetail, listStore]);

  useEffect(() => {
    dispatch(
      DepartmentGetListAction((result) => {
        if (result) {
          setDepartmentTree(result);
          let array: Array<DepartmentView> = convertDepartment(result);
          setDepartment(array);
        }
      })
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
      <Card>
        <div className="padding-20">Không tìm thấy nhân viên</div>
      </Card>
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
      <Form
        ref={formRef}
        layout="vertical"
        onFinish={onFinish}
        initialValues={accountDetail}
      >
        <Card
          title="Thông tin cơ bản"
          extra={
            <Space size={15}>
              <label className="text-default">Trạng thái</label>
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
            </Space>
          }
        >
          <Item noStyle name="version" hidden>
            <Input />
          </Item>
          <div className="padding-20">
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  label="Mã nhân viên"
                  name="code"
                  rules={[{required: true, message: "Vui lòng nhập mã nhân viên"}]}
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
                  rules={[{required: true, message: "Vui lòng chọn giới tính"}]}
                  name="gender"
                  label="Giới tính"
                >
                  <Radio.Group className="ip-radio">
                    {listGender?.map((item) => (
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
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  label="Tên đăng nhập"
                  name="user_name"
                  rules={[{required: true, message: "Vui lòng nhập tên đăng nhập"}]}
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
                  rules={[{required: true, message: "Vui lòng nhập họ và tên"}]}
                >
                  <Input className="r-5" placeholder="Nhập họ và tên" size="large" />
                </Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item name="password" label="Mật khẩu" hasFeedback rules={PASSWORD_RULES}>
                  <Input.Password
                    className="r-5"
                    placeholder="Nhập mật khẩu"
                    size="large"
                    allowClear
                    autoComplete="new-password"
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
                  hasFeedback
                  rules={[
                    ({getFieldValue}) => ({
                      validator(_: RuleObject, value: string) {
                        const password = getFieldValue("password");
                        if (password === value || (!value && !password)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Nhập lại mật khẩu không đúng"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="Nhập lại mật khẩu"
                    allowClear
                    autoComplete="new-password"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  label="Số điện thoại"
                  name="mobile"
                  rules={[
                    {required: true, message: "Vui lòng nhập số điện thoại"},
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
                <Form.Item name="account_stores" label="Cửa hàng">
                  <Select
                    placeholder="Chọn cửa hàng"
                    allowClear
                    showArrow
                    maxTagCount={"responsive" as const}
                    mode={isSelectAllStore ? "tags" : "multiple"}
                    optionFilterProp="children"
                    onChange={(value: any) => {
                      console.log(value);
                      if (
                        (Array.isArray(value) && value.includes("all")) ||
                        value === "all"
                      ) {
                        if (isSelectAllStore) {
                          formRef.current?.setFieldsValue({account_stores: []});
                          setIsSelectAllStore(false);
                        } else {
                          formRef.current?.setFieldsValue({
                            account_stores: selectAllStore,
                          });
                          setIsSelectAllStore(true);
                        }
                      } else {
                        setIsSelectAllStore(false);
                      }
                    }}
                  >
                    <Option value={"all"}>
                      {isSelectAllStore ? "Bỏ chọn tất cả" : "Chọn tất cả cửa hàng"}
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
                <Item
                  label="Ngày sinh"
                  name="birthday"
                  // rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
                >
                  <CustomDatepicker style={{width: "100%"}} placeholder="20/01/2021" />
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
          </div>
        </Card>

        <Collapse
          defaultActiveKey="1"
          className="ant-collapse-card margin-top-20"
          expandIconPosition="right"
        >
          <Collapse.Panel key="1" header="Thông tin công việc">
            <div className="padding-20">
              <Row gutter={24}>
                <Col span={24} lg={24} md={24} sm={24}>
                  <Table
                    columns={columns}
                    rowKey={(record) => record.key}
                    dataSource={listaccountJob}
                    className="sale-product-box-table w-100"
                    tableLayout="fixed"
                    pagination={false}
                  />
                </Col>
              </Row>
              <div className="margin-top-10">
                <Row gutter={24}>
                  <Col span={24} lg={24} md={24} sm={24}>
                    <Button
                      type="link"
                      className="padding-0"
                      icon={<PlusOutlined />}
                      onClick={addNewJob}
                    >
                      Thêm phòng ban/vị trí
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
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
