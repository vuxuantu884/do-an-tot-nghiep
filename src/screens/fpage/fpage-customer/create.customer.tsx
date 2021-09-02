import { Form, Row, Col, Button, Table, Card } from "antd";
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
import moment from "moment";

const initQueryAccount: AccountSearchQuery = {
  info: "",
};
const CustomerAdd = (props: any) => {
  const {
    setCustomerDetail,
    setIsButtonSelected,
    customerDetail,
    customerPhoneList,
    setCustomerPhoneList,
    getCustomerWhenPhoneChange,
  } = props;
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
    [setAccounts]
  );
  const AccountChangeSearch = React.useCallback(
    (value) => {
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setDataAccounts));
    },
    [dispatch, setDataAccounts]
  );
  //mock
  const recentOrder = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Tổng thu",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Chi tiết",
      dataIndex: "detail",
      key: "detail",
    },
  ];

  const data = [
    {
      key: "1",
      date: "01/12",
      total: "650.000",
      status: "Hoàn tất",
      detal: "abc",
    },
  ];

  //end mock
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
    let customer_type_id = 2;
    customerForm.setFieldsValue({ ...new CustomerModel(), customer_type_id });
  }, [customerForm]);
  React.useEffect(() => {
    if (customerDetail) {
      const field = {
        full_name: customerDetail.full_name,
        birthday: customerDetail.birthday
          ? moment(customerDetail.birthday, "YYYY-MM-DD")
          : "",
        phone: customerDetail.phone,
        email: customerDetail.email,
        gender: customerDetail.gender,
        district_id: customerDetail.district_id,
        ward_id: customerDetail.ward,
        full_address: customerDetail.full_address,
      };
      customerForm.setFieldsValue(field);
      
    } else {
      const field = {
        full_name: null,
        birthday: "",
        email: null,
        gender: null,
        district_id: null,
        ward_id: null,
        full_address: null,
      };
      customerForm.setFieldsValue(field);
    }
  }, [customerDetail, customerForm]);
  const setResult = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Thêm khách hàng thành công");
        setCustomerDetail(result);
        setIsButtonSelected(true);
      }
    },
    [history, setCustomerDetail, setIsButtonSelected]
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
      title=""
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
              phones={customerPhoneList}
              setPhones={setCustomerPhoneList}
              getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
            />
          </Col>
        </Row>
        <Card
          title={
            <div>
              <span style={{ fontWeight: 500 }} className="title-card">
                ĐƠN GẦN NHẤT
              </span>
            </div>
          }
        >
          <Table columns={recentOrder} dataSource={data} pagination={false} />
        </Card>
        <div className="customer-bottom-button">
          <Button
            style={{ marginRight: "10px" }}
            onClick={() => history.goBack()}
            type="ghost"
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit">
            Tạo mới khách hàng
          </Button>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerAdd;
