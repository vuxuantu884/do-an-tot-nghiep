import { Dispatch } from "react";
import {
  getInventoryBalanceReportApi,
  InventoryBalanceReportParams,
} from "service/report/inventory-balance-report";
import { callApiNative } from "utils/ApiUtils";
import { showError } from "utils/ToastUtils";

export async function fetchInventoryBalanceList(
  params: InventoryBalanceReportParams,
  dispatch: Dispatch<any>,
) {
  const response: any = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getInventoryBalanceReportApi,
    { ...params, listProductGroupLv1: "ALL", listProductGroupLv2: "ALL" },
  );
  console.log("response", response);

  if (!response) {
    showError("Xảy ra lỗi. Vui lòng thử lại.");
  }
  return response || [];
}
