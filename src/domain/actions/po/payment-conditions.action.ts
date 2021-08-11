import { PaymentConditionsType } from "domain/types/purchase-order.type";
import BaseAction from "base/BaseAction";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

export const PaymentConditionsGetAllAction = (
  setData: (result: Array<PoPaymentConditions>) => void
) => {
  debugger;
  return BaseAction(PaymentConditionsType.GET_PAYMENT_CONDITIONS_REQUEST, {
    setData,
  });
};
