import {
  BUSINESS_RESULT_CART_NAME,
  ONLINE_BUSINESS_RESULT_COMPLETED_QUERY,
} from "config/dashboard";
import { BusinessResultCartItem } from "model/dashboard/dashboard.model";
import { ArrayAny } from "model/report/analytics.model";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDataOneQueryDashboard } from "utils/DashboardUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { DashboardContext } from "../provider/dashboard-provider";

function useFetchOnlineBRCompleted() {
  const dispatch = useDispatch();
  const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } =
    useContext(DashboardContext);
  const [isFetchingOnlineBRCompleted, setIsFetchingOnlineBRCompleted] = useState<boolean>(false);

  useEffect(() => {
    const fetchTotalSaleComplete = async () => {
      setIsFetchingOnlineBRCompleted(true);
      const response = await getDataOneQueryDashboard(
        dispatch,
        showMyData,
        deparmentIdList,
        ONLINE_BUSINESS_RESULT_COMPLETED_QUERY,
      );
      setIsFetchingOnlineBRCompleted(false);

      if (!response) {
        showErrorReport("Lỗi lấy dữ liệu kết quả kinh doanh TC Online");
        return;
      }

      const today = moment().format(DATE_FORMAT.YYYYMMDD);

      let totalSalesDailyActual = 0;
      let totalSalesMonthlyActual = 0;
      let ordersDailyActual = 0;
      let ordersMonthlyActual = 0;
      let returnsDailyActual = 0;
      let returnsMonthlyActual = 0;

      response.result.data.forEach((value: ArrayAny) => {
        // Luỹ kế tháng
        totalSalesMonthlyActual += Number(value[1]);
        ordersMonthlyActual += Number(value[2]);
        returnsMonthlyActual += Number(value[3]);

        // Doanh thu hôm nay
        if (moment.parseZone(value[0]).utc(true).format(DATE_FORMAT.YYYYMMDD) === today) {
          totalSalesDailyActual += Number(value[1]);
          ordersDailyActual += Number(value[2]);
          returnsDailyActual += Number(value[3]);
        }
      });

      // save data source
      setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
        const newState = new Map(prevState);
        newState.set(BUSINESS_RESULT_CART_NAME.onlineTotalSales, {
          value: totalSalesDailyActual,
          monthlyAccumulated: totalSalesMonthlyActual,
        });
        newState.set(BUSINESS_RESULT_CART_NAME.onlineOrders, {
          value: ordersDailyActual,
          monthlyAccumulated: ordersMonthlyActual,
        });
        newState.set(BUSINESS_RESULT_CART_NAME.onlineReturns, {
          value: returnsDailyActual,
          monthlyAccumulated: returnsMonthlyActual,
        });
        return newState;
      });
    };
    fetchTotalSaleComplete();
  }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData]);

  return { isFetchingOnlineBRCompleted };
}

export default useFetchOnlineBRCompleted;
