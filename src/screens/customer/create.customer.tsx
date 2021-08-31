import { Form, Row, Col, Button, Collapse } from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CreateCustomer,
  CustomerGroups,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerModel,
  CustomerContactClass,
} from "model/request/customer.request";
import arrowLeft from "../../assets/icon/arrow-left.svg";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess } from "utils/ToastUtils";
import "./customer.scss";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import GeneralInformation from "./general.information";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import CustomInputContact from "./customInputContact";

const { Panel } = Collapse;
const initQueryAccount: AccountSearchQuery = {
  info: "",
};
const CustomerAdd = (props: any) => {
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [status, setStatus] = React.useState<string>("active");

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
  const AccountChangeSearch = React.useCallback(
    (value) => {
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
    },
    [dispatch, setDataAccounts]
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
  }, [dispatch]);
  React.useEffect(() => {
    let customer_type_id = 2
    customerForm.setFieldsValue({...new CustomerModel(), customer_type_id});
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
      ? new Date(values.birthday).toUTCString()
      : null,
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toUTCString()
        : null,
      status: status,
      city_id: area ? area.city_id : null,
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
