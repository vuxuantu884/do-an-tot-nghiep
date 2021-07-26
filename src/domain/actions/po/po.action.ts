import { POType } from "domain/types/purchase-order.type";
import BaseAction from "base/BaseAction";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

export const PoCreateAction = (
  request: PurchaseOrder | null,
  createCallback: (result: PurchaseOrder) => void
) => {
  return BaseAction(POType.CREATE_PO_REQUEST, {
    request,
    createCallback,
  });
};
