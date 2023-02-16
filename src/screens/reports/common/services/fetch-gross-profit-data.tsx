import { Dispatch } from "react";
import { getGrossProfitReportApi } from "service/report/gross-profit-report.service";
import { callApiNative } from "utils/ApiUtils";
import { showError } from "utils/ToastUtils";
import { GrossProfitReportParams } from "../interfaces/gross-profit.interface";

export async function fetchGrossProfitData(
  params: GrossProfitReportParams,
  dispatch: Dispatch<any>,
) {
  const response: any = await callApiNative(
    { notifyAction: "SHOW_ALL" },
    dispatch,
    getGrossProfitReportApi,
    { ...params },
  );
  console.log("response", response);

  if (!response) {
    showError(
      "Xảy ra lỗi khi lấy dữ liệu báo cáo lợi nhuận gộp theo mã 3, nhóm hàng. Vui lòng thử lại.",
    );
  }
  return response || [];
}
