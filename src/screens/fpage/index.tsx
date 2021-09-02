import React from "react";
import FpageOrders from "./fpage-order/fpage.order";
import CustomerInformation from "./fpage-customer/create.customer";
import { Divider } from "antd";
import { CustomerResponse } from "model/response/customer/customer.response";
import { useQuery, getQueryParams } from "utils/useQuery";
import { useDispatch } from "react-redux";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchByPhone  } from "domain/actions/customer/customer.action";
import "./fpage.index.scss";

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
  const [customerPhoneList, setCustomerPhoneList] = React.useState<Array<any>>([])

  const searchOneCallback = (value: any) => {
    console.log(value)
    if(value !== undefined) {
      setCustomerDetail(value)
    }else{
      setCustomerDetail(undefined)
    }
  }
  
  React.useEffect(() => {
    let list: any = []
    const phoneObj: any = { ...getQueryParams(phoneQuery) };
    const _queryObj = Object.keys(phoneObj);
    const value = phoneObj[_queryObj[0]];
    if(!Array.isArray(value)){
      list.push(value);
    }else{
      list = [...value]
    }
    setCustomerPhoneList(list)

    if (list) {
      initQueryCustomer.phone = list[0];
      dispatch(CustomerSearchByPhone(initQueryCustomer, searchOneCallback));
    }
  }, [dispatch, setCustomerPhoneList]);
console.log("123")
  const getCustomerWhenPhoneChange = React.useCallback((phoneNumber: any) => {
    initQueryCustomer.phone = phoneNumber;
    dispatch(CustomerSearchByPhone(initQueryCustomer, searchOneCallback));
  },[dispatch])
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
          customerPhoneList={customerPhoneList}
          setCustomerPhoneList={setCustomerPhoneList}
          getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
        />
      )}
      {isButtonSelected && (
        <FpageOrders
          customerDetail={customerDetail}
          setCustomerDetail={setCustomerDetail}
          setIsButtonSelected = {setIsButtonSelected}
        />
      )}
    </div>
  );
}

export default FpageCRM;
