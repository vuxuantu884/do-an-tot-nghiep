import { POType } from 'domain/types/purchase-order.type';
import BaseAction from "base/BaseAction"

export const PoCreateAction = () => {
  return BaseAction(POType.CREATE_PO_REQUEST, {});
}