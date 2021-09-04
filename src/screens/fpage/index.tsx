import React, { useCallback } from "react";
import FpageOrders from "./fpage-order/fpage.order";
import FpageCustomer from "./fpage-customer/create.customer";
import { Divider } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useQuery } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { FpageCustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchByPhone } from "domain/actions/customer/customer.action";
import "./fpage.index.scss";
import { getListOrderAction } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel, OrderSearchQuery } from "model/order/order.model";

const initQueryCustomer: FpageCustomerSearchQuery = {
  request: "",
  limit: 10,
  page: 1,
  phone: null,
};
function FpageCRM() {
  let phoneQuery = useQuery();
  const dispatch = useDispatch();
  const [isButtonSelected, setIsButtonSelected] = React.useState<number>(1);
  const [customerDetail, setCustomerDetail] =
    React.useState<CustomerResponse>();
  const [isClearOrderField, setIsClearOrderField] =
    React.useState<boolean>(true);
  const [isCustomerReload, setIsCustomerReload] = React.useState<boolean>(true);
  const [customerPhone, setCustomerPhone] = React.useState<string | null>("");
  const [customerPhoneList, setCustomerPhoneList] = React.useState<
    Array<string>
  >([]);
  const [customerPhoneString] = React.useState<string | null>(
    phoneQuery?.get("phone")
  );

  const [orderHistory, setOrderHistory] = React.useState<Array<OrderModel>>([]);

  const searchByPhoneCallback = (value: any) => {
    console.log(value);
    if (value !== undefined) {
      setCustomerDetail(value);
    } else {
      setCustomerDetail(undefined);
    }
  };

  React.useEffect(() => {
    if (
      customerDetail &&
      customerDetail.id !== null &&
      customerDetail.id !== undefined
    ) {
      let queryObject: OrderSearchQuery = {
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
        ship_by: null,
        note: null,
        customer_note: null,
        tags: [],
        reference_code: null,
      };
      dispatch(getListOrderAction(queryObject, setOrderHistoryItems));
    }
  }, [dispatch, customerDetail]);

  const setOrderHistoryItems = (data: PageResponse<OrderModel> | false) => {
    if (data) {
      setOrderHistory(data.items);
    }
  };
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
            customerDetail={customerDetail}
            setCustomerDetail={setCustomerDetail}
            setIsButtonSelected={setIsButtonSelected}
            customerPhoneList={customerPhoneList}
            setCustomerPhoneList={setCustomerPhoneList}
            getCustomerWhenPhoneChange={getCustomerWhenChoicePhone}
            orderHistory={orderHistory}
            setIsClearOrderField={setIsClearOrderField}
            customerPhone={customerPhone}
            deletePhone={deletePhone}
          />
        )}
      </div>
      <div style={{ display: isButtonSelected === 2 ? "block" : "none" }}>
        {isClearOrderField && (
          <FpageOrders
            customerDetail={customerDetail}
            setCustomerDetail={setCustomerDetail}
            setIsButtonSelected={setIsButtonSelected}
            setIsClearOrderField={setIsClearOrderField}
            setIsCustomerReload={setIsCustomerReload}
            setCustomerPhone={setCustomerPhone}
            setOrderHistory={setOrderHistory}
            getCustomerByPhone={getCustomerWhenChoicePhone}
          />
        )}
      </div>
    </div>
  );
}

export default FpageCRM;
