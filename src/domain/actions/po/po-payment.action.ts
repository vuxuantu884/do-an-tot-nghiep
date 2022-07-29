import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { POPaymentType } from "domain/types/purchase-order.type";
import BaseAction from "base/base.action";

export const PoPaymentCreateAction = (
  poId: number,
  request: PurchasePayments,
  createCallback: (result: PurchasePayments | null) => void,
) => {
  return BaseAction(POPaymentType.CREATE_PO_PAYMENT_REQUEST, {
    poId,
    request,
    createCallback,
  });
};

export const PoPaymentUpdateAction = (
  poId: number,
  paymentId: number,
  request: PurchasePayments | null,
  updateCallback: (result: PurchasePayments | null) => void,
) => {
  return BaseAction(POPaymentType.UPDATE_PO_PAYMENT_REQUEST, {
    poId,
    paymentId,
    request,
    updateCallback,
  });
};

export const PoPaymentDeleteAction = (
  poId: number,
  paymentId: number,
  updateCallback: (result: PurchasePayments | null) => void,
) => {
  return BaseAction(POPaymentType.DELETE_PO_PAYMENT_REQUEST, {
    poId,
    paymentId,
    updateCallback,
  });
};
