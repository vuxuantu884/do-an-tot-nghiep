import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Switch,
  Table,
} from "antd";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import SupplierAction from "domain/actions/core/supplier.action";
import { CityView } from "model/content/district.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {  DepartmentGetListAction, PositionGetListAction } from "domain/actions/account/account.action";
import { AccountJobReQuest, AccountRequest } from "model/account/account.model";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { convertDistrict } from "utils/AppUtils";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { RoleResponse, RoleSearchQuery } from "model/auth/roles.model";
import { RoleGetListAction } from "domain/actions/auth/role.action";
import deleteIcon from "assets/icon/delete.svg";
import moment from "moment";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";

const { Item } = Form;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

const DefaultCountry = 233;
const initRequest: AccountRequest = {
  code: "",
  user_id: "",
  user_name: "",
  gender: "",
  full_name: "",
  mobile: "",
  account_stores: [],
  account_jobs: [],
  roles: [],
  address: "",
  status: "",
  password: "",
};

const initRoleQuery: RoleSearchQuery = {
  page: 0,
  size: 200,
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
  const [listaccountJob, setAccountJob] = useState<Array<AccountJobReQuest>>([
    {
      department_id: 0,
      position_id: 0,
      key: Number(moment().format("x")),
    },
  ]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listRole, setRole] = useState<Array<RoleResponse>>();
  const [listDepartment, setDepartment] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
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
  const addNewJob = () => {
    let listJob = [...listaccountJob];
    listJob.push({
      department_id: 0,
      position_id: 0,
      key: Number(moment().format("x")),
    });
    setAccountJob(listJob);
  };
  const onChangeDepartment = (e: any, key: number) => {
    let listJob = [...listaccountJob];
    listJob[key].department_id = e;
    setAccountJob(listJob);
  };
  const onChangePosition = (e: any, key: number) => {
    let listJob = [...listaccountJob];
    listJob[key].position_id = e;
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
  const onCreateSuccess = useCallback(() => {
    history.push("/suppliers");
  }, [history]);
  const onFinish = useCallback(
    (values: AccountRequest) => {
      debugger;
      values.account_jobs=[...listaccountJob];
      //dispatch(SupplierAction.supplierCreateAction(values, onCreateSuccess));
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
  //end memo

  const columns = [
    {
      title: "Bộ phận",
      render: (text: string, item: AccountJobReQuest, index: number) => {
        return (
          <div>
            <Select
              placeholder="Chọn bộ phận"
              className="selector"
              allowClear
              showArrow
              optionFilterProp="children"
              onChange={(value) => onChangeDepartment(value, index)}
            >
              {listDepartment?.map((item) => (
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
      title: "Vị trí",
      render: (text: string, item: AccountJobReQuest, index: number) => {
        return (
          <div>
            <Select
              placeholder="Chọn bộ phận"
              className="selector"
              allowClear
              showArrow
              optionFilterProp="children"
              onChange={(value) => onChangePosition(value, index)}
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
  useEffect(() => {
    dispatch(DepartmentGetListAction(setDepartment));
    dispatch(PositionGetListAction(setPosition));
    dispatch(RoleGetListAction(initRoleQuery, setRole));
    dispatch(StoreGetListAction(setStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(DefaultCountry, setDataDistrict));
  }, [dispatch, setDataDistrict]);
  return (
    <Form
      ref={formRef}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initRequest}
    >
      <Card
        className="card-block card-block-normal"
        title="Thông tin cơ bản"
        extra={
          <div className="v-extra d-flex align-items-center">
            Trạng thái
            <Switch
              className="ip-switch"
              defaultChecked
              onChange={onChangeStatus}
            />
            <span
              style={{ color: status === "active" ? "#27AE60" : "red" }}
              className="t-status"
            >
              {statusValue}
            </span>
            <Item noStyle name="status" hidden>
              <Input value={status} />
            </Item>
          </div>
        }
      >
        <Row gutter={24}>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Tên đăng nhập"
              name="user_name"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              hasFeedback
            >
              <Input
                className="r-5"
                placeholder="Nhập tên đăng nhập"
                size="large"
              />
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              className="form-group form-group-with-search"
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
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Mã nhân viên"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhân viên" },
              ]}
              hasFeedback
            >
              <Input className="r-5" placeholder="VD: YD0000" size="large" />
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              className="form-group form-group-with-search"
              name="password"
              label="Mật khẩu"
              hasFeedback
            >
              <Input.Password
                className="r-5"
                placeholder="Nhập mật khẩu"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Họ và tên"
              name="full_name"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              hasFeedback
            >
              <Input
                className="r-5"
                placeholder="Nhập họ và tên"
                size="large"
              />
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Form.Item
              name="confirm"
              label="Nhập lại mật khẩu"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập lại mật khẩu",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Nhập lại mật khẩu không đúng!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Số điện thoại"
              name="mobile"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
              hasFeedback
            >
              <Input
                className="r-5"
                placeholder="Nhập số điện thoại"
                size="large"
              />
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Form.Item
              name="account_stores"
              label="Cửa hàng"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
            >
              <Select
                placeholder="Chọn cửa hàng"
                className="selector"
                allowClear
                showArrow
                mode="multiple"
                optionFilterProp="children"
              >
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
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Ngày sinh"
              name="birthday"
              rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
              hasFeedback
            >
              <DatePicker
                className="r-5 w-100 ip-search"
                placeholder="20/01/2021"
                format="DD/MM/YYYY"
              />
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Form.Item
              name="roles"
              label="Nhóm phân quyền"
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhóm phân quyền",
                },
              ]}
            >
              <Select
                placeholder="Chọn cửa hàng"
                className="selector"
                allowClear
                showArrow
                mode="multiple"
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
        <Row className="title-rule">
          <div className="title">Thông tin khác</div>
          <div className="rule" />
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Quốc gia"
              name="country_id"
            >
              <Select disabled className="selector" placeholder="Chọn quốc gia">
                {listCountries?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Item>
          </Col>
          <Col span={24} lg={10} md={12} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Khu vực"
              name="district_id"
            >
              <Select
                showSearch
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
            <Item
              hidden
              className="form-group form-group-with-search"
              name="city_id"
            >
              <Input />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} lg={20} md={24} sm={24}>
            <Item
              className="form-group form-group-with-search"
              label="Địa chỉ"
              name="address"
            >
              <Input className="r-5" placeholder="Địa chỉ" size="large" />
            </Item>
          </Col>
        </Row>
        <Collapse
          expandIconPosition="right"
          className="view-other card-block card-block-normal"
        >
          <Panel header="Thông tin công việc" key="1">
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
            <Row gutter={24}>
              <Col span={24} lg={24} md={24} sm={24}>
                <Button
                  onClick={addNewJob}
                  className="btn-filter yody-search-button w-100"
                >
                  Thêm mới
                </Button>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <Row className="footer-row-btn" justify="end">
        <Button type="default" className="btn-style btn-cancel">Hủy</Button>
        <Button htmlType="submit" type="default" className="btn-style btn-save">Lưu</Button>
      </Row>
      </Card>
    </Form>
  );
};

export default AccountCreateScreen;
