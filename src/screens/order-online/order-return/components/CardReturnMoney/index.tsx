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
  returnMoneyType?: string;
  returnMoneyMethod?: PaymentMethodResponse | null;
  returnMoneyNote?: string;
  setReturnMoneyType?: (value: string) => void;
  setReturnMoneyMethod?: (value: PaymentMethodResponse) => void;
  setReturnMoneyNote?: (value: string) => void;
  setReturnMoneyAmount?: (value: number) => void;
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
    returnMoneyType,
    returnMoneyMethod,
    returnMoneyNote,
    setReturnMoneyType,
    setReturnMoneyNote,
    setReturnMoneyMethod,
    setReturnMoneyAmount,
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
        returnMoneyType={returnMoneyType}
        setReturnMoneyType={setReturnMoneyType}
        returnMoneyMethod={returnMoneyMethod}
        setReturnMoneyMethod={setReturnMoneyMethod}
        returnMoneyNote={returnMoneyNote}
        setReturnMoneyNote={setReturnMoneyNote}
        setReturnMoneyAmount={setReturnMoneyAmount}
      />
    );
  };
  return <StyledComponent>{mainRender()}</StyledComponent>;
}

export default CardReturnMoney;
