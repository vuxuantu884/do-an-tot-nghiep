import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";

import {
  Form,
  Button,
} from "antd";

import moment from "moment";
import { showSuccess, showError } from "utils/ToastUtils";

import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { WardResponse } from "model/content/ward.model";
import { CountryResponse } from "model/content/country.model";

import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {
  getCustomerDetailAction,
  CustomerGroups,
  CustomerTypes,
  UpdateCustomer,
} from "domain/actions/customer/customer.action";

import ContentContainer from "component/container/content.container";
import CustomerGeneralInfo from "screens/customer/common/CustomerGeneralInfo";

import arrowBack from "assets/icon/arrow-back.svg";
import { StyledCustomerInfo } from "screens/customer/customerStyled";
import "screens/customer/customer.scss";

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
      setDistrictId(customer.district_id);
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
    dispatch(getCustomerDetailAction(params.id, setCustomer));
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
    const countrySelected = countries.find((country) => country.id === values.country_id);
    const area = areas.find((area) => area.id === values.district_id);
    const wardSelected = wards.find((item) => item.id === values.ward_id);
    const staffSelected = accounts.find((account) => account.code === values.responsible_staff_code);

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
      country: countrySelected ? countrySelected.name : null,
      city_id: area ? area.city_id : null,
      city: area ? area.city_name : null,
      district: area ? area.name : null,
      ward: wardSelected ? wardSelected.name : null,
      responsible_staff: staffSelected ? staffSelected.full_name : null,
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
    <StyledCustomerInfo>
      <ContentContainer
        title="Sửa khách hàng"
      >
        <Form
          form={customerForm}
          name="customer_edit"
          onFinish={handleSubmit}
          onFinishFailed={handleSubmitFail}
          layout="vertical"
        >
          <CustomerGeneralInfo
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

          <div className="customer-info-footer">
            <Button
              disabled={isLoading}
              type="text"
              className="go-back-button"
            >
               <Link to="/customers">
                <img style={{ marginRight: "10px" }} src={arrowBack} alt="" />
                Quay lại danh sách khách hàng
              </Link>
            </Button>
            
            <div>
              <Button
                disabled={isLoading}
                onClick={goBack}
                style={{ marginRight: 10 }}
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
    </StyledCustomerInfo>
  );
};

export default CustomerUpdate;
