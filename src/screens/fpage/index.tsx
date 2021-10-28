import React, {useEffect, useCallback} from "react";
import FpageOrders from "./fpage-order/FpageOrders";
import FpageCustomer from "./fpage-customer/create.customer";
import {Tabs} from "antd";
import {CustomerResponse} from "model/response/customer/customer.response";
import {FpageCustomerResponse} from "model/response/ecommerce/fpage.response";
import {useQuery} from "utils/useQuery";
import {useDispatch} from "react-redux";
import {FpageCustomerSearchQuery} from "model/query/customer.query";
import {
  CustomerSearchByPhone,
  CustomerDetail,
} from "domain/actions/customer/customer.action";
import "./fpage.index.scss";
import {getListOrderActionFpage} from "domain/actions/order/order.action";
import {
  getFpageCustomerInfo,
  addFpagePhone,
  deleteFpagePhone,
  setFpageDefaultPhone,
} from "domain/actions/ecommerce/ecommerce.actions";
import {PageResponse} from "model/base/base-metadata.response";
import {OrderModel} from "model/order/order.model";
import {LoyaltyPoint} from "model/response/loyalty/loyalty-points.response";
import {LoyaltyUsageResponse} from "model/response/loyalty/loyalty-usage.response";
import {getLoyaltyPoint, getLoyaltyUsage} from "domain/actions/loyalty/loyalty.action";
import {showError} from "utils/ToastUtils";

const {TabPane} = Tabs;

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};

function FpageCRM() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [activeTabKey, setActiveTabKey] = React.useState<string>("1");
  const [customer, setCustomer] = React.useState<CustomerResponse | null>();
  const [isClearOrderTab, setIsClearOrderTab] = React.useState<boolean>(false);
  const [userId] = React.useState<string | null>(queryString?.get("userId"));
  const [fpageCustomerInfo, setFpageCustomerInfo] =
    React.useState<FpageCustomerResponse | null>();

  const [customerPhone, setCustomerPhone] = React.useState<string | null>("");
  const [customerFbName] = React.useState<string | null>(queryString?.get("fbName"));
  const [customerPhones, setCustomerPhones] = React.useState<Array<string>>([]);
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel> | undefined>(
    []
  );
  const [querySearchOrderFpage, setQuerySearchOrderFpage] = React.useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });
  const [metaData, setMetaData] = React.useState<any>({});
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<
    Array<LoyaltyUsageResponse>
  >([]);
  useEffect(() => {
    if (userId) {
      dispatch(getFpageCustomerInfo(userId, setFpageCustomerInfo));
    }
    const getFpageCustomerInfoInterval = setInterval(() => {
      if (userId) {
        dispatch(getFpageCustomerInfo(userId, setFpageCustomerInfo));
      }
    }, 5000);
    return () => clearInterval(getFpageCustomerInfoInterval);
  }, [userId, dispatch, setFpageCustomerInfo]);
  useEffect(() => {
    if (fpageCustomerInfo) {
      const {default_phone, phones} = fpageCustomerInfo;
      if (default_phone) {
        setCustomerPhone(default_phone);
      }
      setCustomerPhones(phones);
    }
  }, [fpageCustomerInfo, setCustomerPhone, setCustomerPhones]);
  const addFpPhone = useCallback(
    (phone: string) => {
      if (userId) {
        dispatch(addFpagePhone(userId, phone, setFpageCustomerInfo));
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
          dispatch(deleteFpagePhone(userId, phone, setFpageCustomerInfo));
        }
      }
    },
    [userId, dispatch, customerPhone]
  );
  const setFpDefaultPhone = useCallback(
    (phone: string) => {
      if (userId) {
        dispatch(setFpageDefaultPhone(userId, phone, setFpageCustomerInfo));
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
  }, [dispatch, customer]);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuerySearchOrderFpage({...querySearchOrderFpage, page, limit});
    },
    [querySearchOrderFpage, setQuerySearchOrderFpage]
  );
  const searchByPhoneCallback = (value: any) => {
    if (value) {
      setCustomer(value);
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
    (phoneNumber: any) => {
      setCustomerPhone(phoneNumber);
      initQueryCustomer.phone = phoneNumber;
      dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
    },
    [dispatch]
  );
  //Render result search
  const handleOnchangeTabs = React.useCallback((value: string) => {
    setActiveTabKey(value);
    setIsClearOrderTab(false);
  }, []);
  const handleCustomerById = (id: number) => {
    dispatch(CustomerDetail(id, searchByPhoneCallback));
  };
  return (
    <div className="fpage-customer-relationship">
      <Tabs
        className="custom-fpage-tabs"
        destroyInactiveTabPane={isClearOrderTab}
        centered
        animated
        activeKey={activeTabKey}
        onChange={(value: string) => handleOnchangeTabs(value)}
      >
        <TabPane key="1" tab={<div>KHÁCH HÀNG</div>}>
          <FpageCustomer
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
          />
        </TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>} forceRender={!isClearOrderTab}>
          <FpageOrders
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
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default FpageCRM;
