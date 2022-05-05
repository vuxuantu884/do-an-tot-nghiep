import { Tag } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import React from "react";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
};

function PaymentStatusTag(props: PropTypes) {
  const { orderDetail } = props;
  
  if(!orderDetail?.payment_status) {
    return null;
  }

  return (
    <StyledComponent>
      {orderDetail?.payment_status === ORDER_PAYMENT_STATUS.unpaid ? (
        <Tag className="orders-tag orders-tag-default">Chưa thanh toán</Tag>
      ) : orderDetail?.payment_status === ORDER_PAYMENT_STATUS.partial_paid ? (
        <Tag className="orders-tag orders-tag-warning">Thanh toán 1 phần</Tag>
      ) : (
        <Tag
          className="orders-tag orders-tag-success"
          style={{
            backgroundColor: "rgba(39, 174, 96, 0.1)",
            color: "#27AE60",
          }}
        >
          Đã thanh toán
        </Tag>
      )}
    </StyledComponent>
  );
}

export default PaymentStatusTag;
