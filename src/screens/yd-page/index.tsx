import React, { useEffect, useCallback, useState } from "react";
import YDPageOrders from "./yd-page-order-create/YDPageOrders";
import YDPageCustomer from "./yd-page-customer/YDPageCustomer";
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
import "./index.scss";
import { getListOrderActionFpage } from "domain/actions/order/order.action";
import {
  getYDPageCustomerInfo,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
} from "domain/actions/ecommerce/ecommerce.actions";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  getLoyaltyPoint,
  getLoyaltyRate,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import { showError } from "utils/ToastUtils";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { BillingAddress, ShippingAddress } from "model/request/order.request";
import { LoyaltyCardSearch } from "../../domain/actions/loyalty/card/loyalty-card.action";
import { YDpageCustomerRequest } from "model/request/customer.request";

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

function YDPageCRM() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [activeTabKey, setActiveTabKey] = React.useState<string>("1");
  const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
  const [newCustomerInfo, setNewCustomerInfo] =
    React.useState<YDpageCustomerRequest>(initCustomerInfo);
  const [isClearOrderTab, setIsClearOrderTab] = React.useState<boolean>(false);
  const [fbCustomerId] = React.useState<string | null>(queryString?.get("fbCustomerId"));
  const [customerFbName] = React.useState<string | null>(queryString?.get("fbName"));
  const [defaultSourceId] = React.useState<number | null>(
    queryString?.get("defaultSourceId") ? Number(queryString?.get("defaultSourceId")) : null
  );
  const [defaultStoreId] = React.useState<number | null>(
    queryString?.get("defaultStoreId") ? Number(queryString?.get("defaultStoreId")) : null
  );

  const [YDPageCustomerInfo, setYDPageCustomerInfo] =
    React.useState<YDPageCustomerResponse | null>();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [customerPhone, setCustomerPhone] = React.useState<string | null>("");
  const [customerPhones, setCustomerPhones] = React.useState<Array<string>>([]);
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel> | undefined>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [loyaltyRate, setLoyaltyRate] = React.useState<LoyaltyRateResponse>();
  const [querySearchOrderFpage, setQuerySearchOrderFpage] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });
  const [fbPageId] = React.useState<string | null>(queryString?.get("fbPageId"));
  const [userId] = React.useState<string | null>(queryString?.get("userId"));
  const [metaData, setMetaData] = React.useState<any>({});
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<Array<LoyaltyUsageResponse>>(
    []
  );
  const [loyaltyCard, setLoyaltyCard] = React.useState<any>();

  const updateLoyaltyCard = useCallback(
    (result) => {
      if (result && result.items && result.items.length) {
        const loyaltyCardData = result.items.find((item: any) => item.customer_id === customer?.id);
        setLoyaltyCard(loyaltyCardData);
      }
    },
    [customer, setLoyaltyCard]
  );

  React.useEffect(() => {
    if (customer?.id) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      dispatch(
        LoyaltyCardSearch({ customer_id: customer.id, statuses: ["ASSIGNED"] }, updateLoyaltyCard)
      );
    } else {
      setLoyaltyPoint(null);
      setLoyaltyCard(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch, customer, updateLoyaltyCard, setLoyaltyCard]);

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
  useEffect(() => {
    if (YDPageCustomerInfo) {
      const { default_phone, phones } = YDPageCustomerInfo;
      if (default_phone) {
        setCustomerPhone(default_phone);
      } else if (phones && phones.length > 0) {
        setCustomerPhone(phones[0]);
      }
      setCustomerPhones(phones);
    }
  }, [YDPageCustomerInfo, setCustomerPhone, setCustomerPhones]);
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
      if (phone === customerPhone) {
        showError("Không được xóa số điện thoại mặc định");
      } else {
        if (fbCustomerId) {
          dispatch(deleteFpagePhone(fbCustomerId, phone, setYDPageCustomerInfo));
        }
      }
    },
    [fbCustomerId, dispatch, customerPhone]
  );
  const setFpDefaultPhone = useCallback(
    (phone: string) => {
      if (fbCustomerId) {
        dispatch(setFpageDefaultPhone(fbCustomerId, phone, setYDPageCustomerInfo));
      }
    },
    [fbCustomerId, dispatch]
  );
  React.useEffect(() => {
    if (customer?.id) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch, customer]);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuerySearchOrderFpage({ ...querySearchOrderFpage, page, limit });
    },
    [querySearchOrderFpage, setQuerySearchOrderFpage]
  );
  const searchByPhoneCallback = useCallback((value: any) => {
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
      setLoyaltyCard(null);
    }
  }, []);
  const setOrderHistoryItems = (data: PageResponse<OrderModel> | false) => {
    if (data) {
      setOrderHistory(data.items);
      setMetaData(data.metadata);
    } else {
      setOrderHistory(undefined);
    }
  };
  React.useEffect(() => {
    if (customer && customer.id !== null && customer.id !== undefined) {
      querySearchOrderFpage.customer_ids = [customer.id];
      dispatch(getListOrderActionFpage(querySearchOrderFpage, setOrderHistoryItems));
    } else {
      setOrderHistory(undefined);
      setMetaData(null);
    }
  }, [customer, dispatch, querySearchOrderFpage]);

  const getCustomerWhenChoicePhone = React.useCallback(
    (phoneNumber: string) => {
      setCustomerPhone(phoneNumber);
      if (phoneNumber) {
        initQueryCustomer.phone = phoneNumber;
        dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
      }
    },
    [dispatch, searchByPhoneCallback]
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
    <div className="yd-page-customer-relationship">
      <Tabs
        className="custom-yd-page-tabs"
        destroyInactiveTabPane={isClearOrderTab}
        centered
        animated
        activeKey={activeTabKey}
        onChange={(value: string) => handleOnchangeTabs(value)}>
        <TabPane key="1" tab={<div>KHÁCH HÀNG</div>}>
          <YDPageCustomer
            customer={customer}
            setCustomer={setCustomer}
            newCustomerInfo={newCustomerInfo}
            setNewCustomerInfo={setNewCustomerInfo}
            getCustomerWhenPhoneChange={getCustomerWhenChoicePhone}
            orderHistory={orderHistory}
            metaData={metaData}
            onPageChange={onPageChange}
            loyaltyPoint={loyaltyPoint}
            loyaltyUsageRules={loyaltyUsageRules}
            customerPhone={customerPhone}
            customerPhones={customerPhones}
            customerFbName={customerFbName}
            addFpPhone={addFpPhone}
            deleteFpPhone={deleteFpPhone}
            setFpDefaultPhone={setFpDefaultPhone}
            loyaltyCard={loyaltyCard}
            setDistrictIdProps={setDistrictId}
          />
        </TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>} forceRender={!isClearOrderTab}>
          <YDPageOrders
            loyaltyRate={loyaltyRate}
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
            setOrderHistory={setOrderHistory}
            getCustomerByPhone={getCustomerWhenChoicePhone}
            loyaltyPoint={loyaltyPoint}
            loyaltyUsageRules={loyaltyUsageRules}
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

export default YDPageCRM;
