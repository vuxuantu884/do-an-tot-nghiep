import { PaymentConditionsType } from "domain/types/purchase-order.type";
import BaseAction from "base/base.action";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

export const PaymentConditionsGetAllAction = (
  setData: (result: Array<PoPaymentConditions>) => void,
) => {
  return BaseAction(PaymentConditionsType.GET_PAYMENT_CONDITIONS_REQUEST, {
    setData,
  });
};
