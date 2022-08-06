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

  const getTag = {
    [ORDER_PAYMENT_STATUS.unpaid]: (
      <Tag className="orders-tag orders-tag-default">Chưa thanh toán</Tag>
    ),
    [ORDER_PAYMENT_STATUS.partial_paid]: (
      <Tag className="orders-tag orders-tag-warning">Thanh toán 1 phần</Tag>
    ),
    [ORDER_PAYMENT_STATUS.paid]: <Tag className="orders-tag orders-tag-success">Đã thanh toán</Tag>,
  };

  if (!orderDetail?.payment_status) {
    return null;
  }

  return <StyledComponent>{getTag[orderDetail.payment_status]}</StyledComponent>;
}

export default PaymentStatusTag;
