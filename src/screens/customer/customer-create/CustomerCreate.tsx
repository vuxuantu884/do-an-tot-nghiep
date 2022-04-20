import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Form, Button } from "antd";

import { showSuccess, showError } from "utils/ToastUtils";

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
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import {
  CustomerModel,
  CustomerContactClass,
} from "model/request/customer.request";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";

import ContentContainer from "component/container/content.container";
import CustomerContactInfo from "screens/customer/common/CustomerContactInfo";
import CustomerGeneralInfo from "screens/customer/common/CustomerGeneralInfo";

import arrowBack from "assets/icon/arrow-back.svg";
import { StyledCustomerInfo } from "screens/customer/customerStyled";
import "screens/customer/customer.scss";


const initQueryAccount: AccountSearchQuery = {
  info: "",
};
const CustomerCreate = (props: any) => {
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  
  const reload = React.useCallback(() => {
    customerForm.resetFields();
  }, [customerForm]);

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

  const setResult = React.useCallback(
    (result) => {
      setIsLoading(false);
      if (result) {
        showSuccess("Thêm khách hàng thành công");
        history.replace(`/customers/${result.id}`);
      }
    },
    [history]
  );

  const handleSubmit = (values: any) => {
    const countrySelected = countries.find((country) => country.id === values.country_id);
    const area = areas.find((area) => area.id === values.district_id);
    const wardSelected = wards.find((item) => item.id === values.ward_id);
    const staffSelected = accounts.find((account) => account.code === values.responsible_staff_code);

    const params = {
      ...values,
      birthday: values.birthday
        ? new Date(values.birthday).toISOString()
        : null,
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toUTCString()
        : null,
      status: status,
      country: countrySelected ? countrySelected.name : null,
      city_id: area ? area.city_id : null,
      city: area ? area.city_name : null,
      district: area ? area.name : null,
      ward: wardSelected ? wardSelected.name : null,
      responsible_staff: staffSelected ? staffSelected.full_name : null,
      phone: values.phone?.trim(),
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
    
    setIsLoading(true);
    dispatch(CreateCustomer({ ...new CustomerModel(), ...params }, setResult));
  };

  const handleSubmitFail = (errorFields: any) => {
    const fieldName = errorFields[0].name.join("");
    if (fieldName === "contact_name" || fieldName === "contact_phone") {
      showError("Vui lòng nhập thông tin liên hệ");
    }
  };

  return (
    <StyledCustomerInfo>
      <ContentContainer
        title="Thêm khách hàng"
      >
        <Form
          form={customerForm}
          name="customer_add"
          onFinish={handleSubmit}
          onFinishFailed={({ errorFields }) => handleSubmitFail(errorFields)}
          layout="vertical"
        >
          <CustomerGeneralInfo
            form={customerForm}
            name="general_add"
            isLoading={isLoading}
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

          <CustomerContactInfo
            form={customerForm}
            isLoading={isLoading}
          />
          
          <div className="customer-info-footer">
            <Button
              disabled={isLoading}
              onClick={() => history.replace("/customers")}
              type="text"
              className="go-back-button"
            >
              <span>
                <img style={{ marginRight: "10px" }} src={arrowBack} alt="" />
                Quay lại danh sách khách hàng
              </span>
            </Button>
            
            <div>
              <Button
                disabled={isLoading}
                onClick={() => reload()}
                style={{ marginRight: 10 }}
                type="ghost"
              >
                Huỷ
              </Button>

              <Button type="primary" htmlType="submit" loading={isLoading}>
                Tạo mới khách hàng 
              </Button>
            </div>
          </div>
        </Form>
      </ContentContainer>
    </StyledCustomerInfo>
  );
};

export default CustomerCreate;
