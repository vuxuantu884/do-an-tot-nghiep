import React, {useEffect, useCallback, useState} from "react";
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
  CustomerSearchByPhone
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
import {getLoyaltyPoint, getLoyaltyRate, getLoyaltyUsage} from "domain/actions/loyalty/loyalty.action";
import { showError } from "utils/ToastUtils";
import {LoyaltyRateResponse} from "model/response/loyalty/loyalty-rate.response";
import {BillingAddress, ShippingAddress} from "model/request/order.request";
import {LoyaltyCardSearch} from "../../domain/actions/loyalty/card/loyalty-card.action";

const { TabPane } = Tabs;

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};

function YDPageCRM() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [activeTabKey, setActiveTabKey] = React.useState<string>("1");
  const [customer, setCustomer] = React.useState<CustomerResponse | null>(null);
  const [isClearOrderTab, setIsClearOrderTab] = React.useState<boolean>(false);
  const [userId] = React.useState<string | null>(queryString?.get("userId"));
  const [customerFbName] = React.useState<string | null>(queryString?.get("fbName"));
  const [YDPageCustomerInfo, setYDPageCustomerInfo] = React.useState<YDPageCustomerResponse | null>();
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [customerPhone, setCustomerPhone] = React.useState<string | null>("");
  const [customerPhones, setCustomerPhones] = React.useState<Array<string>>([]);
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel> | undefined>(
    []
  );
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [loyaltyRate, setLoyaltyRate] = React.useState<LoyaltyRateResponse>()
  const [querySearchOrderFpage, setQuerySearchOrderFpage] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });
  const [pageId] = React.useState<string | null>(queryString?.get("pageId"));
  const [metaData, setMetaData] = React.useState<any>({});
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [loyaltyCard, setLoyaltyCard] = React.useState<any>();

  const updateLoyaltyCard = useCallback((result) => {
    if (result && result.items && result.items.length) {
      const loyaltyCardData = result.items.find((item: any) => item.customer_id === customer?.id);
      setLoyaltyCard( loyaltyCardData);
    }
  }, [customer, setLoyaltyCard]);
  React.useEffect(() => {
    if (customer?.id) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      dispatch(LoyaltyCardSearch({ customer_id: customer.id, status: "ACTIVE"}, updateLoyaltyCard));
    } else {
      setLoyaltyPoint(null);
      setLoyaltyCard(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch, customer, updateLoyaltyCard]);

  useEffect(() => {
    if (userId) {
      dispatch(getYDPageCustomerInfo(userId, setYDPageCustomerInfo));
    }
    const getFpageCustomerInfoInterval = setInterval(() => {
      if (userId) {
        dispatch(getYDPageCustomerInfo(userId, setYDPageCustomerInfo));
      }
    }, 5000);
    return () => clearInterval(getFpageCustomerInfoInterval);
  }, [userId, dispatch, setYDPageCustomerInfo]);
  useEffect(() => {
    if (YDPageCustomerInfo) {
      const { default_phone, phones } = YDPageCustomerInfo;
      if (default_phone) {
        setCustomerPhone(default_phone);
      }
      setCustomerPhones(phones);
    }
  }, [YDPageCustomerInfo, setCustomerPhone, setCustomerPhones]);
  const addFpPhone = useCallback(
    (phone: string, callback: () => void) => {
      if (userId) {
        dispatch(addFpagePhone(userId, phone, (customerInfo: YDPageCustomerResponse) => {
          setYDPageCustomerInfo(customerInfo);
          callback();
        }));
      }
    },
    [userId, dispatch]
  );
  const deleteFpPhone = useCallback(
    (phone: string) => {
      if (phone === customerPhone) {
        showError("Không được xóa số điện thoại mặc định");
      } else {
        if (userId) {
          dispatch(deleteFpagePhone(userId, phone, setYDPageCustomerInfo));
        }
      }
    },
    [userId, dispatch, customerPhone]
  );
  const setFpDefaultPhone = useCallback(
    (phone: string) => {
      if (userId) {
        dispatch(setFpageDefaultPhone(userId, phone, setYDPageCustomerInfo));
      }
    },
    [userId, dispatch]
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
  const searchByPhoneCallback = (value: any) => {
    if (value) {
      setCustomer(value);
      setVisibleCustomer(true)
      setDistrictId(value.district_id)
      if(value.shipping_addresses?.length > 0){
          const address = value.shipping_addresses.find((item: any) => item.default)
          setShippingAddress(address)
      }
      if(value.billing_addresses){
        const billing = value.billing_addresses.find((item: any) => item.default)
        setBillingAddress(billing)
      }
    } else {
      setCustomer(null);
    }
  };
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
    [dispatch]
  );
  //Render result search
  const handleOnchangeTabs = React.useCallback((value: string) => {
    setActiveTabKey(value);
    setIsClearOrderTab(false);
  }, []);

  const handleCustomerById = React.useCallback((id: number | null) => {
    dispatch(getCustomerDetailAction(id, searchByPhoneCallback));
  }, [dispatch])

  return (
    <div className="yd-page-customer-relationship">
      <Tabs
        className="custom-yd-page-tabs"
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
          />
        </TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>} forceRender={!isClearOrderTab}>
          <YDPageOrders
              loyaltyRate={loyaltyRate}
            fbId={userId}
            pageId={pageId}
            customer={customer}
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
