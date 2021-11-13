import {
  Form,
  Row,
  Col,
  Button,
} from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  CustomerDetail,
  CustomerGroups,
  CustomerTypes,
  UpdateCustomer,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import "./customer.scss";
import moment from "moment";
import { showSuccess, showError } from "utils/ToastUtils";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import GeneralInformation from "./common/general.information";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { WardResponse } from "model/content/ward.model";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import arrowLeft from "../../assets/icon/arrow-left.svg";

const initQueryAccount: AccountSearchQuery = {
  info: "",
};
const CustomerUpdate = (props: any) => {
  const params = useParams() as any;
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [customer, setCustomer] = React.useState<any>();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  // const [companies, setCompanies] = React.useState<Array<any>>([]);
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
    if (customer?.district_id) {
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
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(CustomerDetail(params.id, setCustomer));
  }, [dispatch, params]);

  React.useEffect(() => {
    if (customer) { 
      customerForm.setFieldsValue({
        ...customer,
        country_id: countryId,
        birthday: customer.birthday
          ? moment(customer.birthday)
          : null,
        wedding_date: customer.wedding_date
          ? moment(customer.wedding_date)
          : null,
      });
      setStatus(customer.status);
    }
  }, [customer, customerForm, countryId]);

  const goBack = () => {
    history.goBack();
  };

  const setResult = React.useCallback(
    (result) => {
      setIsLoading(false);
      if (result) {
        showSuccess("Cập nhật khách hàng thành công");
        history.goBack();
      }
    },
    [history]
  );
  const handleSubmit = (values: any) => {
    values.full_name = values.full_name.trim();
    if (!values.full_name) return showError("Vui lòng nhập họ tên khách hàng");
    const processValue = {
      ...values,
      birthday: values.birthday
        ? new Date(values.birthday).toUTCString()
        : null,
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toUTCString()
        : null,
      status: status,
      version: customer.version,
      shipping_addresses: customer.shipping_addresses.map((item: any) => {
        let _item = { ...item };
        _item.is_default = _item.default;
        return _item;
      }),
      billing_addresses: customer.billing_addresses.map((item: any) => {
        let _item = { ...item };
        _item.is_default = _item.default;
        return _item;
      }),
      contacts: customer.contacts,
    };

    setIsLoading(true);
    dispatch(UpdateCustomer(params.id, processValue, setResult));
  };
  const handleSubmitFail = (errorInfo: any) => {
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
              isLoading={isLoading}
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
              isEdit={true}
              AccountChangeSearch={AccountChangeSearch}
            />
          </Col>
        </Row>

        <div className="customer-bottom-button" style={{}}>
          <Link to="/customers">
            <div style={{ cursor: "pointer" }}>
              <img style={{ marginRight: "10px", transform: "rotate(180deg)" }} src={arrowLeft} alt="" />
              Quay lại danh sách khách hàng
            </div>
          </Link>
          <div>
            <Button
              disabled={isLoading}
              onClick={goBack}
              style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
              type="ghost"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Lưu khách hàng
            </Button>
          </div>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerUpdate;
