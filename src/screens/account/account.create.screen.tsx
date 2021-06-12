import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Radio,
  Row,
  Select,
  Switch,
} from "antd";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import SupplierAction from "domain/actions/core/supplier.action";
import { CityView } from "model/other/district-view";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SupplierCreateRequest } from "model/request/create-supplier.request";
import { AccountRequest } from "model/account/account.model";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { CountryResponse } from "model/response/content/country.response";
import { DistrictResponse } from "model/response/content/district.response";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { convertDistrict } from "utils/AppUtils";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";

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
  roles:[],
  address: "",
  status: "",
  password: "",
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
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [cityViews, setCityView] = useState<Array<CityView>>([]);
  const [status, setStatus] = useState<string>(initRequest.status);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
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
  const onCreateSuccess = useCallback(() => {
    history.push("/suppliers");
  }, [history]);
  const onFinish = useCallback(
    (values: SupplierCreateRequest) => {
      dispatch(SupplierAction.supplierCreateAction(values, onCreateSuccess));
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
  useEffect(() => {
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
              rules={[
                { required: true, message: "Vui lòng nhập ngày sinh" },
              ]}
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
                {listStore?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default AccountCreateScreen;
