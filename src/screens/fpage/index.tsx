import React, { useCallback } from "react";
import FpageOrders from "./fpage-order/FpageOrders";
import FpageCustomer from "./fpage-customer/create.customer";
import { Divider, Tabs } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { FpageCustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchByPhone } from "domain/actions/customer/customer.action";
import "./fpage.index.scss";
import { getListOrderActionFpage } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";

const { TabPane } = Tabs;

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};

function FpageCRM() {
  let queryString = useQuery();
  const dispatch = useDispatch();
  const [isButtonSelected, setIsButtonSelected] = React.useState<number>(1);
  const [customer, setCustomer] = React.useState<CustomerResponse | null>();
  const [isClearOrderField, setIsClearOrderField] =
    React.useState<boolean>(true);
  const [isCustomerReload, setIsCustomerReload] = React.useState<boolean>(true);
  const [customerPhone, setCustomerPhone] = React.useState<string | null>("");
  const [customerPhoneList, setCustomerPhoneList] = React.useState<
    Array<string>
  >([]);
  const [customerPhoneString] = React.useState<string | null>(
    queryString?.get("phone")
  );
  const [customerFbName] = React.useState<string | null>(
    queryString?.get("name")
  );
  const [orderHistory, setOrderHistory] = React.useState<
    Array<OrderModel> | undefined
  >([]);
  const [querySearchOrderFpage, setQuerySearchOrderFpage] = React.useState<any>(
    {
      limit: 10,
      page: 1,
      customer_ids: null,
    }
  );
  const [metaData, setMetaData] = React.useState<any>({});
  const [loyaltyPoint, setLoyaltyPoint] = React.useState<LoyaltyPoint | null>(
    null
  );
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = React.useState<
    Array<LoyaltyUsageResponse>
  >([]);

  React.useEffect(() => {
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
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
      dispatch(
        getListOrderActionFpage(querySearchOrderFpage, setOrderHistoryItems)
      );
    } else {
      setOrderHistory(undefined);
      setMetaData(null);
    }
  }, [customer, dispatch, querySearchOrderFpage]);

  const deletePhone = useCallback(
    (p: any, e: any) => {
      e.stopPropagation();
      let _phones = [...customerPhoneList];
      const index: any = _phones.indexOf(p);
      _phones.splice(index, 1);
      setCustomerPhoneList(_phones);
    },
    [customerPhoneList]
  );

  React.useEffect(() => {
    if (customerPhoneString) {
      const phoneList: Array<string> = customerPhoneString.split(",");
      setCustomerPhoneList(phoneList);
    }
  }, [setCustomerPhoneList, customerPhoneString]);

  const getCustomerWhenChoicePhone = React.useCallback(
    (phoneNumber: any) => {
      setCustomerPhone(phoneNumber);
      initQueryCustomer.phone = phoneNumber;
      dispatch(CustomerSearchByPhone(initQueryCustomer, searchByPhoneCallback));
    },
    [dispatch]
  );
  //Render result search
  return (
    <div className="fpage-customer-relationship">
      <div className="fpage-customer-head-btn">
        <div
          onClick={() => {
            setIsButtonSelected(1);
            setIsCustomerReload(true);
          }}
          className={
            isButtonSelected === 1
              ? "fpage-customer-btn fpage-btn-active"
              : "fpage-customer-btn"
          }
        >
          KHÁCH HÀNG
        </div>
        <div
          onClick={() => {
            setIsButtonSelected(2);
            setIsClearOrderField(true);
            setIsCustomerReload(false);
          }}
          className={
            isButtonSelected === 2
              ? "fpage-customer-btn fpage-btn-active"
              : "fpage-customer-btn"
          }
        >
          TẠO ĐƠN
        </div>
      </div>
      <Divider />

      <div style={{ display: isButtonSelected === 1 ? "block" : "none" }}>
        {isCustomerReload && (
          <FpageCustomer
            customer={customer}
            setCustomer={setCustomer}
            setIsButtonSelected={setIsButtonSelected}
            customerPhoneList={customerPhoneList}
            setCustomerPhoneList={setCustomerPhoneList}
            getCustomerWhenPhoneChange={getCustomerWhenChoicePhone}
            orderHistory={orderHistory}
            setIsClearOrderField={setIsClearOrderField}
            customerPhone={customerPhone}
            deletePhone={deletePhone}
            metaData={metaData}
            onPageChange={onPageChange}
            customerFbName={customerFbName}
            loyaltyPoint={loyaltyPoint}
            loyaltyUsageRules={loyaltyUsageRules}
          />
        )}
      </div>
      <div style={{ display: isButtonSelected === 2 ? "block" : "none" }}>
        {isClearOrderField && (
          <FpageOrders
            customer={customer}
            setCustomer={setCustomer}
            setIsButtonSelected={setIsButtonSelected}
            setIsClearOrderField={setIsClearOrderField}
            setIsCustomerReload={setIsCustomerReload}
            setCustomerPhone={setCustomerPhone}
            setOrderHistory={setOrderHistory}
            getCustomerByPhone={getCustomerWhenChoicePhone}
            loyaltyPoint={loyaltyPoint}
            loyaltyUsageRules={loyaltyUsageRules}
          />
        )}
      </div>
      <Tabs
        className="custom-fpage-tabs"
        destroyInactiveTabPane={true}
        defaultActiveKey="2"
        centered
        size="large"
        tabPosition="top"
        // onChange={(value) => ShipMethodOnChange(parseInt(value))}
      >
        <TabPane key="1" tab={<div>KHÁCH HÀNG</div>}></TabPane>
        <TabPane key="2" tab={<div>TẠO ĐƠN</div>}></TabPane>
      </Tabs>
    </div>
  );
}

export default FpageCRM;
