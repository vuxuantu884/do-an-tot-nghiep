import { Dispatch } from "react";
import {
  getInventoryBalanceReportApi,
  getProductInfoApi,
  getStoreByProvinceApi,
  InventoryBalanceFilterParams,
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
    { ...params },
  );
  console.log("response", response);

  if (!response) {
    showError("Xảy ra lỗi. Vui lòng thử lại.");
  }
  return response || [];
}

export async function fetchProductInfo(
  dispatch: Dispatch<any>,
  params?: InventoryBalanceFilterParams,
) {
  const response: any = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getProductInfoApi,
    { ...params },
  );
  if (!response) {
    showError("Xảy ra lỗi. Vui lòng thử lại.");
  }
  return response;
}

export async function fetchStoreByProvince(dispatch: Dispatch<any>, province?: string) {
  const response: any = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getStoreByProvinceApi,
    province,
  );
  if (!response) {
    showError("Xảy ra lỗi. Vui lòng thử lại.");
  }
  return response;
}
