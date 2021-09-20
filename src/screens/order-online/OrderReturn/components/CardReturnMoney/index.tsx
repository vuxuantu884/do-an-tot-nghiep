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
  isExchange: boolean;
  isStepExchange: boolean;
  totalAmountNeedToPay?: number;
};
function CardReturnMoney(props: PropType) {
  const {
    listPaymentMethods,
    amountReturn,
    payments,
    handlePayments,
    isDetailPage,
    totalAmountNeedToPay,
    isExchange,
    isStepExchange,
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
        payments={payments}
        handlePayments={handlePayments}
        totalAmountNeedToPay={totalAmountNeedToPay}
        isExchange={isExchange}
        isStepExchange={isStepExchange}
      />
    );
  };
  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnMoney;
