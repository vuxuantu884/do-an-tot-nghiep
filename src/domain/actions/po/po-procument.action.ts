import { POProcumentType } from "domain/types/purchase-order.type";
import BaseAction from "base/base.action";
import { ImportProcument, ProcurementQuery, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { PageResponse } from "model/base/base-metadata.response";
import BaseResponse from "base/base.response";

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
  procumentId: number,
  request: PurchaseProcument,
  updateCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.UPDATE_PO_PROCUMENT_REQUEST, {
    poId,
    procumentId,
    request,
    updateCallback,
  });
};

export const ConfirmPoProcumentAction = (
  poId: number,
  procumentId: number,
  request: PurchaseProcument,
  updateCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.CONFIRM_PROCUMENT, {
    poId,
    procumentId,
    request,
    updateCallback,
  });
};

export const ApprovalPoProcumentAction = (
  poId: number,
  procumentId: number,
  request: PurchaseProcument,
  updateCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.APROVAL_PROCUMENT, {
    poId,
    procumentId,
    request,
    updateCallback,
  });
};

export const PoProcumentFinishAction = (
  poId: number,
  status: string,
  updateCallback: (result: PurchaseProcument | null) => void
) => {
  return BaseAction(POProcumentType.FINNISH_PO_PROCUMENT_REQUEST, {
    poId,
    status,
    updateCallback,
  });
};

export const PoProcumentDeleteAction = (
  poId: number,
  procumentId: number,
  deleteCallback: (result: boolean) => void
) => {
  return BaseAction(POProcumentType.DELETE_PO_PROCUMENT_REQUEST, {
    poId,
    procumentId,
    deleteCallback,
  });
};


export const POSearchProcurement = (
  query: ProcurementQuery,
  onResult: (result: PageResponse<PurchaseProcument>|false) => void
) => {
  return BaseAction(POProcumentType.SEARCH_PROCUREMENT, {
    query,
    onResult
  });
};

export const importProcumentAction = (
  params: ImportProcument,
  onResult: (result: BaseResponse<any>|false) => void
) => {
  return BaseAction(POProcumentType.IMPORT_PROCUMENT, {
    params,
    onResult
  });
};

