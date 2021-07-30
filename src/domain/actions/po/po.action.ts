import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import { POType } from "domain/types/purchase-order.type";
import BaseAction from "base/BaseAction";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PageResponse } from "model/base/base-metadata.response";

export const PoCreateAction = (
  request: PurchaseOrder | null,
  createCallback: (result: PurchaseOrder) => void
) => {
  return BaseAction(POType.CREATE_PO_REQUEST, {
    request,
    createCallback,
  });
};

export const PoDetailAction = (
  id: number,
  setData: (data: PurchaseOrder | null) => void
) => {
  return BaseAction(POType.DETAIL_PO_REQUEST, { id, setData });
};

export const PoSearchAction = (
  query: PurchaseOrderQuery,
  setData: (data: PageResponse<PurchaseOrder> | false) => void
) => {
  return BaseAction(POType.SEARCH_PO_REQUEST, {
    query,
    setData,
  });
};

