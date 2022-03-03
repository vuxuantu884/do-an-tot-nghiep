/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useState } from "react";
import YDPageOrders from "./yd-page-order-create/YDPageOrders";
import YDPageCustomer from "screens/yd-page/yd-page-customer/YDPageCustomer";
import { Tabs } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { YDPageCustomerResponse } from "model/response/ecommerce/fpage.response";
import { useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { FpageCustomerSearchQuery } from "model/query/customer.query";
import {
  getCustomerDetailAction,
  CustomerSearchByPhone,
} from "domain/actions/customer/customer.action";
import {
  getYDPageCustomerInfo,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
} from "domain/actions/ecommerce/ecommerce.actions";

import { showError } from "utils/ToastUtils";
import { YDpageCustomerRequest } from "model/request/customer.request";

import "screens/yd-page/index.scss";
import {BillingAddress, ShippingAddress} from "../../model/request/order.request";

const { TabPane } = Tabs;

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};

const initCustomerInfo: YDpageCustomerRequest = {
  full_name: null,
  phone: null,
  birthday: "",
  email: null,
  gender: null,
  city_id: null,
  district_id: null,
  ward_id: null,
  full_address: null,
  card_number: null,
};

function YDPageAdmin() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [activeTabKey, setActiveTabKey] = React.useState<string>("1");
  const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
  const [newCustomerInfo, setNewCustomerInfo] = useState<YDpageCustomerRequest>(initCustomerInfo);
  const [isClearOrderTab, setIsClearOrderTab] = useState<boolean>(false);
  const [fbCustomerId] = React.useState<string | null>(queryString?.get("fbCustomerId"));
  const [customerFbName] = React.useState<string | null>(queryString?.get("fbName"));
  const [defaultSourceId] = React.useState<number | null>(
    queryString?.get("defaultSourceId") ? Number(queryString?.get("defaultSourceId")) : null
  );
  const [defaultStoreId] = React.useState<number | null>(
    queryString?.get("defaultStoreId") ? Number(queryString?.get("defaultStoreId")) : null
  );

  const [YDPageCustomerInfo, setYDPageCustomerInfo] = useState<YDPageCustomerResponse | null>();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>("");
  const [customerDefaultPhone, setCustomerDefaultPhone] = useState<string>("");
  const [customerPhones, setCustomerPhones] = useState<Array<string>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);

  const [fbPageId] = React.useState<string | null>(queryString?.get("fbPageId"));
  const [userId] = React.useState<string | null>(queryString?.get("userId"));

  const [isEditCustomer, setIsEditCustomer] = React.useState<boolean>(false);


  useEffect(() => {
    const handleEvent = (event: any) => {
      const { data } = event;
      const { cmd } = data;
      switch (cmd) {
        case "phone_updated":
          if (fbCustomerId) {
            dispatch(getYDPageCustomerInfo(fbCustomerId, setYDPageCustomerInfo));
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("message", handleEvent, false);
    return () => {
      window.removeEventListener("message", handleEvent, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fbCustomerId) {
      dispatch(getYDPageCustomerInfo(fbCustomerId, setYDPageCustomerInfo));
    }
  }, [fbCustomerId, dispatch, setYDPageCustomerInfo]);

  const searchByPhoneCallback = useCallback((value: any) => {
    setIsEditCustomer(false);
    if (value) {
      setCustomer(value);
      setVisibleCustomer(true);
      setDistrictId(value.district_id);
      if (value.shipping_addresses?.length > 0) {
        const address = value.shipping_addresses.find((item: any) => item.default);
        setShippingAddress(address);
      }
      if (value.billing_addresses) {
        const billing = value.billing_addresses.find((item: any) => item.default);
        setBillingAddress(billing);
      }
    } else {
      setCustomer(null);
    }
  }, []);

  const getCustomerWhenPhoneChange = useCallback(
    (phoneNumber: string) => {
      setCustomerPhone(phoneNumber);
      if (phoneNumber) {
        initQueryCustomer.phone = phoneNumber;
        dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
      }
    },
    [customerPhone, dispatch, searchByPhoneCallback]
  );

  useEffect(() => {
    if (YDPageCustomerInfo) {
      const { default_phone, phones } = YDPageCustomerInfo;
      if (default_phone) {
        setCustomerPhone(default_phone);
        setCustomerDefaultPhone(default_phone);
      } else if (phones && phones.length > 0) {
        getCustomerWhenPhoneChange(phones[0]);
      }
      setCustomerPhones(phones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [YDPageCustomerInfo]);

  useEffect(() => {
    if (customerDefaultPhone) {
      initQueryCustomer.phone = customerDefaultPhone;
      dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
    }
  }, [customerDefaultPhone, dispatch, searchByPhoneCallback]);

  const addFpPhone = useCallback(
    (phone: string, callback: () => void) => {
      if (fbCustomerId) {
        dispatch(
          addFpagePhone(fbCustomerId, phone, (customerInfo: YDPageCustomerResponse) => {
            setYDPageCustomerInfo(customerInfo);
            callback();
          })
        );
      }
    },
    [fbCustomerId, dispatch]
  );

  const deleteFpPhone = useCallback(
    (phone: string) => {
      if (phone === customerDefaultPhone) {
        showError("Không được xóa số điện thoại mặc định");
      } else {
        if (fbCustomerId) {
          dispatch(deleteFpagePhone(fbCustomerId, phone, setYDPageCustomerInfo));
        }
      }
    },
    [customerDefaultPhone, fbCustomerId, dispatch]
  );

  const setFpDefaultPhone = useCallback(
    (phone: string) => {
      if (fbCustomerId) {
        setCustomerPhone(phone);
        setCustomerDefaultPhone(phone);
        dispatch(setFpageDefaultPhone(fbCustomerId, phone, setYDPageCustomerInfo));
      }
    },
    [fbCustomerId, dispatch]
  );

  //Render result search
  const handleOnchangeTabs = React.useCallback((value: string) => {
    setActiveTabKey(value);
    setIsClearOrderTab(false);
  }, []);

  const handleCustomerById = React.useCallback(
    (id: number | null) => {
      dispatch(getCustomerDetailAction(id, searchByPhoneCallback));
    },
    [dispatch, searchByPhoneCallback]
  );

  return (
    <div className="yd-page-admin">
      <Tabs
        className="yd-page-admin-tabs"
        destroyInactiveTabPane={isClearOrderTab}
        centered
        animated
        activeKey={activeTabKey}
        onChange={(value: string) => handleOnchangeTabs(value)}
      >
        <TabPane key="1" tab={<div>KHÁCH HÀNG</div>}>
          <YDPageCustomer
            customer={customer}
            setCustomer={setCustomer}
            isEditCustomer={isEditCustomer}
            setIsEditCustomer={setIsEditCustomer}
            newCustomerInfo={newCustomerInfo}
            setNewCustomerInfo={setNewCustomerInfo}
            getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
            customerPhone={customerPhone}
            customerDefaultPhone={customerDefaultPhone}
            customerPhones={customerPhones}
            customerFbName={customerFbName}
            addFpPhone={addFpPhone}
            deleteFpPhone={deleteFpPhone}
            setFpDefaultPhone={setFpDefaultPhone}
						setCustomerDefaultPhone={setCustomerDefaultPhone}
          />
        </TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>}>
          <YDPageOrders
            fbCustomerId={fbCustomerId}
            fbPageId={fbPageId}
            defaultSourceId={defaultSourceId}
            defaultStoreId={defaultStoreId}
            customer={customer}
            newCustomerInfo={newCustomerInfo}
            userId={userId}
            setCustomer={setCustomer}
            setActiveTabKey={setActiveTabKey}
            setIsClearOrderTab={setIsClearOrderTab}
            setCustomerPhone={setCustomerPhone}
            getCustomerByPhone={getCustomerWhenPhoneChange}
            handleCustomerById={handleCustomerById}
            setShippingAddress={setShippingAddress}
            setBillingAddress={setBillingAddress}
            shippingAddress={shippingAddress}
            billingAddress={billingAddress}
            setVisibleCustomer={setVisibleCustomer}
            isVisibleCustomer={isVisibleCustomer}
            districtId={districtId}
            setDistrictId={setDistrictId}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default YDPageAdmin;
