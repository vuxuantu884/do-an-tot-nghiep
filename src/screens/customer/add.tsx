import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Card,
  InputNumber,
  Collapse,
} from "antd";
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
import { CustomerModel } from "model/request/customer.request";
import arrowLeft from "../../assets/icon/arrow-left.svg";
import moment from "moment";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess } from "utils/ToastUtils";
import AddressForm from "./address";
import ContactForm from "./contact";
import "./customer.scss";
import NoteForm from "./note";
import RenderCardAdress from "./render/card.address";
import RenderCardContact from "./render/card.contact";
import RenderCardNote from "./render/card.note";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import GeneralInformation from "./general.infor";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";

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
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  const handleChangeArea = (districtId: string) => {
    setDistrictId(districtId);
  };
  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  const getResponsibleStaffCode = () => {};

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
        history.goBack();
      }
    },
    [history]
  );
  const handleSubmit = (values: any) => {
    console.log("Success:", values);
    let piece = {
      ...values,
      birthday: moment(new Date(values.birthday), "YYYY-MM-DD").format(
        "YYYY-MM-DD"
      ),
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toISOString()
        : null,
      // billing_addresses: values.billing_addresses.map((b: any) => {
      //   return { ...b, is_default: b.default };
      // }),
      // shipping_addresses: values.shipping_addresses.map((b: any) => {
      //   return { ...b, is_default: b.default };
      // }),
    };
    console.log(piece);
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
              name="general_information"
              accounts={accounts}
              groups={groups}
              types={types}
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={18}>
            <Collapse
              className="customer-contact-collapse"
              defaultActiveKey={["1"]}
              style={{ backgroundColor: "white", marginTop: 16 }}
              expandIconPosition="right"
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
                <RenderCardContact
                  component={ContactForm}
                  title="THÔNG TIN LIÊN HỆ"
                  name="contacts"
                  isEdit={false}
                  form={customerForm}
                />
              </Panel>
            </Collapse>
          </Col>
          <Col span={6} />
        </Row>
        {/* <Row>
          <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardAdress
              name="billing_addresses"
              component={AddressForm}
              title="ĐỊA CHỈ NHẬN HÓA ĐƠN "
              countries={countries}
              isEdit={false}
              form={customerForm}
            />
          </Col>
          <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardAdress
              name="shipping_addresses"
              component={AddressForm}
              title="ĐỊA CHỈ GIAO HÀNG"
              countries={countries}
              isEdit={false}
              form={customerForm}
            />
          </Col>
          <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardNote component={NoteForm} title="GHI CHÚ" name="notes" />
          </Col>
        </Row> */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: ".75rem",
            marginLeft: -30,
            height: 55,
            width: "100%",
            boxShadow: "0px -1px 8px rgba(0, 0, 0, 0.1)",
            alignItems: "center",
            padding: "0 32px",
            position: "fixed",
            bottom: "0px",
            backgroundColor: "white",
            zIndex: 99,
            paddingRight: 280,
          }}
        >
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
              Lưu khách hàng
            </Button>
          </div>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerAdd;
