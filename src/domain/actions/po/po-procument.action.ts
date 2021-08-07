import { POProcumentType } from "domain/types/purchase-order.type";
import BaseAction from "base/BaseAction";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";

export const PoProcumentCreateAction = (
  poId: number,
  request: PurchaseProcument,
  createCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.CREATE_PO_PROCUMENT_REQUEST, {
    poId,
    request,
    createCallback,
  });
};
export const PoProcumentUpdateAction = (
  poId: number,
  paymentId: number,
  request: PurchaseProcument,
  updateCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.UPDATE_PO_PROCUMENT_REQUEST, {
    poId,
    paymentId,
    request,
    updateCallback,
  });
};
