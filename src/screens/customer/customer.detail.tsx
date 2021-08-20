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
import { Link, useHistory, useParams } from "react-router-dom";
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
  const [customerPointInfo, setCustomerPoint] = React.useState([]) as any;
  const [customerBuyDetail, setCustomerBuyDetail] = React.useState([]) as any;

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
    let details: any = [];
    if (customer) {
      details = [
        { name: "Điểm hiện tại", value: null },
        {
          name: "Hạng thẻ hiện tại",
          value: null,
        },
        {
          name: "Mã số thẻ",
          value: null,
        },
        {
          name: "Giá trị còn để lên hạng",
          value: null,
        },
        {
          name: "Ngày kích hoạt",
          value: null,
        },
        {
          name: "Ngày hết hạn",
          value: null,
        },
        {
          name: "Cửa hàng kích hoạt",
          value: null,
        },
      ];
    }
    setCustomerPoint(details);
  }, [customer, setCustomerPoint]);

  React.useEffect(() => {
    let details: any = [];
    if (customer) {
      details = [
        { name: "Tổng chi tiêu", value: null },
        {
          name: "Tổng đơn hàng",
          value: null,
        },
        {
          name: "Ngày đầu tiên mua hàng",
          value: null,
        },
        {
          name: "Tổng số lượng sản phẩm đã mua",
          value: null,
        },
        {
          name: "Ngày cuối cùng mua hàng",
          value: null,
        },
        {
          name: "Tổng số lượng sản phẩm hoàn trả",
          value: null,
        },
      ];
    }
    setCustomerBuyDetail(details);
  }, [customer, setCustomerBuyDetail]);

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
            extra={[<Link to={`/customer/edit/${params.id}`}>Cập nhật</Link>]}
          >
            <Row style={{ padding: "16px 30px" }}>
              {customerDetail &&
                customerDetail.map((detail: any, index: number) => (
                  <Col
                    key={index}
                    span={12}
                    style={{
                      display: "flex",
                      marginBottom: 20,
                      color: "#222222",
                    }}
                  >
                    <Col span={12}>
                      <span>{detail.name}</span>
                    </Col>
                    <Col span={12}>
                      <b>: {detail.value ? detail.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
          <Card
            style={{ marginTop: 16 }}
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN MUA HÀNG</span>
              </div>
            }
            extra={[<Link to={``}>Chi tiết</Link>]}
          >
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerBuyDetail &&
                customerBuyDetail.map((info: any, index: number) => (
                  <Col
                    key={index}
                    span={12}
                    style={{
                      display: "flex",
                      marginBottom: 20,
                      color: "#222222",
                    }}
                  >
                    <Col span={14}>
                      <span>{info.name}</span>
                    </Col>
                    <Col span={10}>
                      <b>: {info.value ? info.value : "---"}</b>
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
            <Row gutter={30} style={{ padding: "16px" }}>
              {customerPointInfo &&
                customerPointInfo.map((detail: any, index: number) => (
                  <Col
                    key={index}
                    span={24}
                    style={{
                      display: "flex",
                      marginBottom: 20,
                      color: "#222222",
                    }}
                  >
                    <Col span={14}>
                      <span>{detail.name}</span>
                    </Col>
                    <Col span={10}>
                      <b>: {detail.value ? detail.value : "---"}</b>
                    </Col>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}></Row>
    </ContentContainer>
  );
};

export default CustomerEdit;
