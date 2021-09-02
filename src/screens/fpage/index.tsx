import React from "react";
import FpageOrders from "./fpage-order/order.screen";
import CustomerInformation from "./fpage-customer/create.customer";
import "./fpage.index.scss";
import { Divider } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useQuery, getQueryParams } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchOne } from "domain/actions/customer/customer.action";

const initQueryCustomer: CustomerSearchQuery = {
  request: "",
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

  React.useEffect(() => {
    const phoneObj: any = { ...getQueryParams(phoneQuery) };
    const _queryObj = Object.keys(phoneObj);
    const value = phoneObj[_queryObj[0]];
    if (value) {
      initQueryCustomer.request = value;
      dispatch(CustomerSearchOne(initQueryCustomer, setCustomerDetail));
    }
  }, [dispatch]);
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
          onClick={() => setIsButtonSelected(true)}
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
      {!isButtonSelected && (
        <CustomerInformation
          customerDetail={customerDetail}
          setCustomerDetail={setCustomerDetail}
          setIsButtonSelected={setIsButtonSelected}
        />
      )}
      {isButtonSelected && (
        <FpageOrders
          customerDetail={customerDetail}
          setCustomerDetail={setCustomerDetail}
        />
      )}
    </div>
  );
}

export default FpageCRM;
