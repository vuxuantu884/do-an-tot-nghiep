import { OrderPaymentRequest } from "model/request/order.request";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React from "react";
import CardReturnMoneyPageCreate from "./CardReturnMoneyPageCreate";
import CardReturnMoneyPageDetail from "./CardReturnMoneyPageDetail";
import { StyledComponent } from "./styles";

type PropType = {
  listPaymentMethods: Array<PaymentMethodResponse>;
  amountReturn: number;
  payments: OrderPaymentRequest[];
  handlePayments: (value: Array<OrderPaymentRequest>) => void;
  isDetailPage: boolean;
};
function CardReturnMoney(props: PropType) {
  const {
    listPaymentMethods,
    amountReturn,
    payments,
    handlePayments,
    isDetailPage,
  } = props;
  const mainRender = () => {
    if (isDetailPage) {
      return (
        <CardReturnMoneyPageDetail
          listPaymentMethods={listPaymentMethods}
          amountReturn={amountReturn}
          payments={payments}
          handlePayments={handlePayments}
        />
      );
    }
    return (
      <CardReturnMoneyPageCreate
        listPaymentMethods={listPaymentMethods}
        amountReturn={amountReturn}
        payments={payments}
        handlePayments={handlePayments}
      />
    );
  };
  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnMoney;
