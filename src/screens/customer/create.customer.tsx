import { Input, Form, Row, Col, Select, Button, Card, Collapse } from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CreateCustomer,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerModel,
  CustomerContactClass,
} from "model/request/customer.request";
import arrowLeft from "../../assets/icon/arrow-left.svg";
import moment from "moment";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showError, showSuccess } from "utils/ToastUtils";
import "./customer.scss";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import GeneralInformation from "./general.information";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { RegUtil } from "utils/RegUtils";
import CustomInputContact from "./customInputContact";

const { Option } = Select;
const { Panel } = Collapse;

const CustomerAdd = (props: any) => {
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [companies, setCompanies] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId, setCountryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [status, setStatus] = React.useState<string>("active");
  const initQueryAccount: AccountSearchQuery = {
    info: "",
  };
  const AccountChangeSearch = React.useCallback(
    (value) => {
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
    },
    [dispatch, initQueryAccount]
  );

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      const _items = data.items.filter((item) => item.status === "active");
      setAccounts(_items);
    },
    []
  );

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
      let area = areas.find((area) => area.id === districtId);
      let value = customerForm.getFieldsValue();
      value.city_id = area.city_id;
      value.city = area.city_name;
      value.district_id = districtId;
      value.district = area.name;
      value.ward_id = null;
      value.ward = "";
      customerForm.setFieldsValue(value);
    }
  };

  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  React.useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  React.useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
  React.useEffect(() => {
    customerForm.setFieldsValue(new CustomerModel());
  }, [customerForm]);
  const setResult = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Thêm khách hàng thành công");
        history.replace(`/customers/${result.id}`);
      }
    },
    [history]
  );

  const handleSubmit = (values: any) => {
    let area = areas.find((area) => area.id === districtId);
    let piece = {
      ...values,
      birthday: values.birthday
      ? new Date(values.birthday).toISOString()
      : null,
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toISOString()
        : null,
      status: status,
      city_id: area ? area.city_id : null,
      gender: "other",
      contacts: [
        {
          ...CustomerContactClass,
          name: values.contact_name,
          phone: values.contact_phone,
          note: values.contact_note,
          email: values.contact_email,
        },
      ],
    };
    dispatch(CreateCustomer({ ...new CustomerModel(), ...piece }, setResult));
  };
  const handleSubmitFail = (errorInfo: any) => {
    console.error("Failed:", errorInfo);
  };
  return (
    <ContentContainer
      title="Thêm khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customer`,
        },
        {
          name: "Thêm khách hàng",
        },
      ]}
    >
      <Form
        form={customerForm}
        name="customer_add"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralInformation
              form={customerForm}
              name="general_add"
              accounts={accounts}
              groups={groups}
              types={types}
              status={status}
              setStatus={setStatus}
              areas={areas}
              countries={countries}
              wards={wards}
              handleChangeArea={handleChangeArea}
              AccountChangeSearch={AccountChangeSearch}
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={18}>
            <Collapse
              className="customer-contact-collapse"
              style={{ backgroundColor: "white", marginTop: 16 }}
              expandIconPosition="right"
              defaultActiveKey={["1"]}
            >
              <Panel
                className=""
                header={
                  <span
                    style={{
                      textTransform: "uppercase",
                      fontWeight: 500,
                      padding: "6px",
                    }}
                  >
                    THÔNG TIN LIÊN HỆ
                  </span>
                }
                key="1"
              >
                <Row gutter={30} style={{ padding: "0 15px" }}>
                  <CustomInputContact  form={customerForm}/>
                  <Col span={12}>
                    <Form.Item
                      label={<b>Email:</b>}
                      name="contact_email"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Vui lòng nhập thư điện tử",
                      //   },
                      // ]}
                    >
                      <Input maxLength={255} placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                  <Col span={24} style={{ padding: "0 1rem" }}>
                    <Row gutter={8}>
                      <Col span={24}>
                        <Form.Item label={<b>Ghi chú:</b>} name="contact_note">
                          <Input.TextArea
                            maxLength={500}
                            placeholder="Nhập ghi chú"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </Col>
          <Col span={6} />
        </Row>
        <div className="customer-bottom-button">
          <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            Quay lại danh sách khách hàng
          </div>
          <div>
            <Button
              onClick={() => history.goBack()}
              style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
              type="ghost"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Tạo mới khách hàng
            </Button>
          </div>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerAdd;
