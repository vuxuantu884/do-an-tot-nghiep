import { Dispatch } from "react";
import { getSellingPowerReportApi } from "service/report/inventory-balance-report";
import { callApiNative } from "utils/ApiUtils";
import { showError } from "utils/ToastUtils";
import { SellingPowerReportParams } from "../interfaces/selling-power-report.interface";

export async function fetchSellingPowerList(
  params: SellingPowerReportParams,
  dispatch: Dispatch<any>,
) {
  const response: any = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getSellingPowerReportApi,
    { ...params },
  );
  console.log("response", response);

  if (!response) {
    showError("Xảy ra lỗi khi lấy dữ liệu báo cáo tồn bán sức bán. Vui lòng thử lại.");
  }
  return response || [];
}
