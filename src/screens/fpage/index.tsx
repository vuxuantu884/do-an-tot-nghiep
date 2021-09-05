import React from "react";
import FpageOrders from "./fpage-order/fpage.order";
import FpageCustomer from "./fpage-customer/create.customer";
import { Divider } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useQuery, getQueryParams } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchByPhone } from "domain/actions/customer/customer.action";
import "./fpage.index.scss";
import { getListOrderAction } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import {OrderModel,OrderSearchQuery } from "model/order/order.model";

const initQueryCustomer: CustomerSearchQuery = {
  request: "",
  phone: null,
  limit: 10,
  page: 1,
  gender: null,
  from_birthday: null,
  to_birthday: null,
  company: null,
  from_wedding_date: null,
  to_wedding_date: null,
  customer_type_id: null,
  customer_group_id: null,
  customer_level_id: null,
  responsible_staff_code: null,
};
function FpageCRM() {
  const phoneQuery = useQuery();
  const dispatch = useDispatch();
  const [isButtonSelected, setIsButtonSelected] =
    React.useState<boolean>(false);
  const [customerDetail, setCustomerDetail] =
    React.useState<CustomerResponse>();
  const [isClearOrderField, setIsClearOrderField] =
    React.useState<boolean>(false);
  const [customerPhoneList, setCustomerPhoneList] = React.useState<Array<any>>([])
  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel>>();

  const searchByPhoneCallback = (value: any) => {
    console.log(value);
    if (value !== undefined) {
      setCustomerDetail(value);
    } else {
      setCustomerDetail(undefined);
    }
  };


  React.useEffect(() => {
    if(customerDetail && customerDetail.id != null && customerDetail.id !== undefined){
    let queryObject:OrderSearchQuery = {
      page: 1,
      limit: 10,
      sort_type: null,
      sort_column: null,
      code: null,
      store_ids: [],
      source_ids: [],
      customer_ids: [customerDetail.id],
      issued_on_min: null,
      issued_on_max: null,
      issued_on_predefined: null,
      finalized_on_min: null,
      finalized_on_max: null,
      finalized_on_predefined: null,
      ship_on_min: null,
      ship_on_max: null,
      ship_on_predefined: null,
      expected_receive_on_min: null,
      expected_receive_on_max: null,
      expected_receive_predefined: null,
      completed_on_min: null,
      completed_on_max: null,
      completed_on_predefined: null,
      cancelled_on_min: null,
      cancelled_on_max: null,
      cancelled_on_predefined: null,
      order_status: [],
      order_sub_status: [],
      fulfillment_status: [],
      payment_status: [],
      return_status: [],
      account: [],
      assignee: [],
      price_min: undefined,
      price_max: undefined,
      payment_method_ids: [],
      delivery_types: [],
      note: null,
      customer_note: null,
      tags: [],
      reference_code: null
    }
    dispatch(getListOrderAction(queryObject, setOrderHistoryItems));
  }
  }, [dispatch, customerDetail]);

  const setOrderHistoryItems = (data: PageResponse<OrderModel> | false) => {
    if(data){
      console.log("orderx",data.items)
      setOrderHistory(data.items);
    }
  }
  
  React.useEffect(() => {
    let list: any = [];
    const phoneObj: any = { ...getQueryParams(phoneQuery) };
    const _queryObj = Object.keys(phoneObj);
    const value = phoneObj[_queryObj[0]];

    if (value) {
      if (!Array.isArray(value)) {
        list.push(value);
      } else {
        list = [...value];
      }
    }
    setCustomerPhoneList(list);
  }, [phoneQuery, setCustomerPhoneList]);

  const getCustomerWhenPhoneChange = React.useCallback(
    (phoneNumber: any) => {
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
          onClick={() => setIsButtonSelected(false)}
          className={
            !isButtonSelected
              ? "fpage-customer-btn fpage-btn-active"
              : "fpage-customer-btn"
          }
        >
          KHÁCH HÀNG
        </div>
        <div
          onClick={() => {
            setIsButtonSelected(true);
            setIsClearOrderField(false);
          }}
          className={
            isButtonSelected
              ? "fpage-customer-btn fpage-btn-active"
              : "fpage-customer-btn"
          }
        >
          TẠO ĐƠN
        </div>
      </div>
      <Divider />
      <div style={{ display: !isButtonSelected ? "block" : "none" }}>
        <FpageCustomer
          customerDetail={customerDetail}
          setCustomerDetail={setCustomerDetail}
          setIsButtonSelected={setIsButtonSelected}
          customerPhoneList={customerPhoneList}
          setCustomerPhoneList={setCustomerPhoneList}
          getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
          orderHistory={orderHistory}
        />
      </div>
      <div style={{ display: isButtonSelected ? "block" : "none" }}>
        {!isClearOrderField && (
          <FpageOrders
            customerDetail={customerDetail}
            setCustomerDetail={setCustomerDetail}
            setIsButtonSelected={setIsButtonSelected}
            setIsClearOrderField={setIsClearOrderField}
          />
        )}
      </div>
    </div>
  );
        }

export default FpageCRM;
