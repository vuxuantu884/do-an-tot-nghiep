import React from "react";
import FpageOrders from "./fpage-order/order.screen";
import CustomerInformation from "./fpage-customer/create.customer";
import "./fpage.index.scss";
import {Divider} from "antd"

function FpageCRM() {
  const [isButtonSelected, setIsButtonSelected] =
    React.useState<boolean>(false);

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
      {!isButtonSelected && <CustomerInformation />}
      {isButtonSelected && <FpageOrders />}
    </div>
  );
}

export default FpageCRM;
