import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Card,
  Collapse,
} from "antd";
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
import GeneralInformation from "./general.information";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { BillingAddress } from './../../model/request/order.request';
import { WardResponse } from "model/content/ward.model";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";

const { Option } = Select;
const { Panel } = Collapse;

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
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId, setCountryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [accounts, setAccounts] = React.useState<Array<AccountResponse>>([]);
  const [status, setStatus] = React.useState<string>("active");
  
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
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  const handleChangeArea = (districtId: string) => {
    if(districtId){
      setDistrictId(districtId);
      let area = areas.find((area) => area.id === districtId)
      let value = customerForm.getFieldsValue();
      value.city_id = area.city_id;
      value.city = area.city_name;
      value.district_id = districtId;
      value.district = area.name;
      value.ward_id = null;
      value.ward = "";
      customerForm.setFieldsValue(value)
    }
   
    
  };
  console.log(customer)
  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  React.useEffect(() => {
    if(customer){
      dispatch(WardGetByDistrictAction(customer.district_id, setWards));
    }
  }, [dispatch, customer]);


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
      setStatus(customer.status)
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
      // billing_addresses: values.billing_addresses.map((b: any) => {
      //   if (b.hasOwnProperty("is_default")) {
      //     return b;
      //   } else {
      //     return { ...b, is_default: b.default };
      //   }
      // }),
      // shipping_addresses: values.shipping_addresses.map((b: any) => {
      //   if (b.hasOwnProperty("is_default")) {
      //     return b;
      //   } else {
      //     return { ...b, is_default: b.default };
      //   }
      // }),
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
      title="Quản lý khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customers`,
        },
        {
          name: "Sửa thông tin khách hàng",
        },
      ]}
    >
      <Form
        form={customerForm}
        name="customer_edit"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
        layout="vertical"
        // initialValues={customerInit}
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralInformation
              accounts={accounts}
              form={customerForm}
              name="general edit"
              groups={groups}
              types={types}
              customer={customer}
              status={status}
              setStatus={setStatus}
              areas={areas}
              countries={countries}
              wards={wards}
              districtId={districtId}
              handleChangeArea={handleChangeArea}
            />
          </Col>
          {/* <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardAdress
              name="billing_addresses"
              component={AddressForm}
              title="ĐỊA CHỈ NHẬN HÓA ĐƠN "
              countries={countries}
              form={customerForm}
              isEdit={true}
              reload={reload}
            />
          </Col>
          <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardAdress
              name="shipping_addresses"
              component={AddressForm}
              title="ĐỊA CHỈ GIAO HÀNG"
              countries={countries}
              form={customerForm}
              isEdit={true}
              reload={reload}
            />
          </Col>
          
          <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardNote component={NoteForm} title="GHI CHÚ" name="notes" />
          </Col> */}
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
                  form={customerForm}
                  isEdit={true}
                  reload={reload}
                />
              </Panel>
            </Collapse>
          </Col>
          <Col span={6} />
        </Row>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: ".75rem",
          }}
        >
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
          <Button
            onClick={() => history.goBack()}
            style={{ marginLeft: ".75rem" }}
            type="ghost"
          >
            Hủy
          </Button>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerEdit;
