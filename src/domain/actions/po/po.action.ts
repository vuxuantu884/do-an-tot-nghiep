import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import { POConfig, POLogHistory, POType } from "domain/types/purchase-order.type";
import BaseAction from "base/base.action";
import {
  PurchaseOrder,
  PurchaseOrderPrint,
} from "model/purchase-order/purchase-order.model";
import { PageResponse } from "model/base/base-metadata.response";
import BaseResponse from "base/base.response";
import { ImportProcument } from "model/purchase-order/purchase-procument";
import { ImportResponse } from "model/other/files/export-model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { ActionLogDetailResponse, PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";

export const POGetActionLogDetail = (
  id: number,
  handleData: (data: ActionLogDetailResponse) => void
) => {
  return {
    type: POType.GET_ACTION_LOG_DETAILS,
    payload: {
      id,
      handleData,
    },
  };
};

export const POGetPurchaseOrderActionLogs = (
  id: number,
  handleData: (data: PurchaseOrderActionLogResponse[]) => void
) => {
  return {
    type: POType.GET_PURCHASE_ORDER_ACTION_LOGS,
    payload: {
      id,
      handleData,
    },
  };
};

export const POGetPrintContentAction = (
  id: number,
  updatePrintCallback: (result: Array<PurchaseOrderPrint>) => void
) => {
  return BaseAction(POType.GET_PRINT_CONTENT, {
    id,
    updatePrintCallback,
  });
};
export const PoCreateAction = (
  request: PurchaseOrder | null,
  createCallback: (result: PurchaseOrder) => void
) => {
  return BaseAction(POType.CREATE_PO_REQUEST, {
    request,
    createCallback,
  });
};
export const PoUpdateFinancialStatusAction = (
  id: number,
  updateCallback: (result: PurchaseOrder | null) => void
) => {
  return BaseAction(POType.UPDATE_PO_FINANCIAL_STATUS_REQUEST, {
    id,
    updateCallback,
  });
};

export const PoUpdateAction = (
  id: number,
  request: PurchaseOrder | null,
  updateCallback: (result: PurchaseOrder | null) => void
) => {
  return BaseAction(POType.UPDATE_PO_REQUEST, {
    id,
    request,
    updateCallback,
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

export const PODeleteAction = (
  id: number,
  deleteCallback: (result: any | null) => void
) => {
  return BaseAction(POType.DELETE_PO_REQUEST, {
    id,
    deleteCallback,
  });
};

export const POReturnAction = (
  id: number,
  request: PurchaseOrder | null,
  returnCallback: (result: any | null) => void
) => {
  return BaseAction(POType.RETURN_PO_REQUEST, {
    id,
    request,
    returnCallback,
  });
};

export const POCancelAction = (
  id: number,
  cancelCallback: (result: PurchaseOrder | null) => void
) => {
  return BaseAction(POType.CANCEL_PO_REQUEST, {
    id,
    cancelCallback,
  });
};

export const exportPOAction = (
  params: ImportProcument,
  onResult: (result: BaseResponse<ImportResponse>|false) => void
) => {
  return BaseAction(POType.EXPORT_PO, {
    params,
    onResult
  });
};

export const getConfigPoAction = (
  code: string,
  onResult: (result: BaseResponse<Array<FilterConfig>>) => void
) => {
  return BaseAction(POConfig.GET_PO_CONFIG, {
    code,
    onResult
  });
};
export const createConfigPoAction = (
  request: FilterConfigRequest,
  onResult?: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(POConfig.CREATE_PO_CONFIG, {
    request,
    onResult
  });
};
export const updateConfigPoAction = (
  request: FilterConfigRequest,
  onResult?: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(POConfig.UPDATE_PO_CONFIG, {
    request,
    onResult
  });
};

export const deleteConfigPoAction = (
  id: number,
  onResult: (result: BaseResponse<FilterConfig>) => void
) => {
  return BaseAction(POConfig.DELETE_PO_CONFIG, {
    id,
    onResult
  });
};

export const getLogDetailPOHistory = (
  id: number,
  setData: (result: BaseResponse<PurchaseOrder>) => void
) => {
  return BaseAction(POLogHistory.GET_LOG_DETAIL_PO, {
    id,
    setData
  });
};

export const getLogPOHistory = (
  code: string,
  setData: (result: BaseResponse<PurchaseOrder>) => void
) => {
  return BaseAction(POLogHistory.GET_LOG_PO, {
    code,
    setData
  });
};