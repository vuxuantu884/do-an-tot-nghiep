import { Button } from "antd";
import { FulFillmentResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse;
  goodsReturnCallback: (id: number | null) => void;
};

function OrderFulfillmentReceiveGoods(props: PropTypes) {
  const { fulfillment, goodsReturnCallback } = props;

  const checkIfShowReceiveGoodsButton = (fulfillment: FulFillmentResponse) => {
    return fulfillment.return_status === FulFillmentStatus.RETURNING;
  };

  if (!checkIfShowReceiveGoodsButton(fulfillment)) {
    return null;
  }

  return (
    <StyledComponent>
      <div className="buttonReceiveGoodsWrapper">
        <Button
          key={fulfillment.id}
          type="primary"
          className="ant-btn-outline fixed-button text-right"
          onClick={() => goodsReturnCallback(fulfillment.id)}
        >
          Nhận hàng
        </Button>
      </div>
    </StyledComponent>
  );
}

export default OrderFulfillmentReceiveGoods;
