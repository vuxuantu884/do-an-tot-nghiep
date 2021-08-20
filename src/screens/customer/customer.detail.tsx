import { Input, Form, Row, Col, DatePicker, Select, Button, Card } from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  CustomerDetail,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
  UpdateCustomer,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import AddressForm from "./address";
import ContactForm from "./contact";
import "./customer.scss";
import NoteForm from "./note";
import RenderCardAdress from "./render/card.address";
import RenderCardContact from "./render/card.contact";
import RenderCardNote from "./render/card.note";
import moment from "moment";
import { showSuccess } from "utils/ToastUtils";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import GeneralInformation from "./general.infor";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";

const { Option } = Select;

const CustomerEdit = (props: any) => {
  const params = useParams() as any;
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [customer, setCustomer] = React.useState<any>();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [companies, setCompanies] = React.useState<Array<any>>([]);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [customerDetail, setCustomerDetail] = React.useState([]) as any;

  const statuses = [
    { name: "Hoạt động", key: "1", value: "active" },
    { name: "Không hoạt động", key: "2", value: "inactive" },
  ];

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        { name: "Họ tên khách hàng", value: customer.full_name },
        {
          name: "Giới tính",
          value: customer.gender,
        },
        {
          name: "Số điện thoại",
          value: customer.phone,
        },
        {
          name: "Ngày sinh",
          value: customer.birthday,
        },
        {
          name: "Ngày cưới",
          value: customer.wedding_date,
        },
        {
          name: "Đơn vị",
          value: customer.company,
        },
        {
          name: "Website/Facebook",
          value: customer.website,
        },
        {
          name: "Mã khách hàng",
          value: customer.code,
        },
        {
          name: "Loại khách hàng",
          value: customer.customer_type,
        },
        {
          name: "Nhóm khách hàng",
          value: customer.customer_group,
        },
        {
          name: "Nhân viên phụ trách",
          value: customer.responsible_staff_code,
        },
        {
          name: "Ghi chú",
          value: customer.description,
        },
      ];
    }
    setCustomerDetail(details);
  }, [customer, setCustomerDetail]);

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
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params]);
  console.log(customer);
  React.useEffect(() => {
    if (customer) {
      customerForm.setFieldsValue({
        ...customer,
        birthday: moment(customer.birthday, "YYYY-MM-DD"),
        wedding_date: customer.wedding_date
          ? moment(customer.wedding_date, "YYYY-MM-DD")
          : null,
      });
    }
  }, [customer, customerForm]);
  const reload = React.useCallback(() => {
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params.id]);
  const setResult = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Cập nhật khách hàng thành công");
        history.goBack();
      }
    },
    [history]
  );
  const handleSubmit = (values: any) => {
    console.log("Success:", values);
    const processValue = {
      ...values,
      birthday: moment(values.birthday, "YYYY-MM-DD").format("YYYY-MM-DD"),
      wedding_date: values.wedding_date
        ? moment(values.wedding_date, "YYYY-MM-DD").format("YYYY-MM-DD")
        : null,
      billing_addresses: values.billing_addresses.map((b: any) => {
        if (b.hasOwnProperty("is_default")) {
          return b;
        } else {
          return { ...b, is_default: b.default };
        }
      }),
      shipping_addresses: values.shipping_addresses.map((b: any) => {
        if (b.hasOwnProperty("is_default")) {
          return b;
        } else {
          return { ...b, is_default: b.default };
        }
      }),
    };
    dispatch(
      UpdateCustomer(params.id, { ...customer, ...processValue }, setResult)
    );
  };
  const handleSubmitFail = (errorInfo: any) => {
    console.error("Failed:", errorInfo);
  };
  return (
    <ContentContainer
      title={customer && customer.full_name}
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
          name: "Chi tiết khách hàng",
        },
      ]}
    >
      <Row gutter={24}>
        <Col span={18}>
          <Card
            title={
              <div>
                <span className="title-card">THÔNG TIN CÁ NHÂN</span>
              </div>
            }
          >
            <Row style={{ padding: "16px 30px" }}>
              {customerDetail.map((detail: any, index: number) => (
                <Col
                  key={index}
                  span={12}
                  style={{ display: "flex", marginBottom: 20 }}
                >
                  <Col span={12}>
                    <span>{detail.name}</span>
                  </Col>
                  <Col span={12}>
                    <b>: {detail.value}</b>
                  </Col>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN TÍCH ĐIỂM</span>
              </div>
            }
          >
            <Row gutter={12} style={{ padding: "16px" }}></Row>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN MUA HÀNG</span>
              </div>
            }
          >
            <Row gutter={12} style={{ padding: "16px" }}></Row>
          </Card>
        </Col>
      </Row>
    </ContentContainer>
  );
};

export default CustomerEdit;
