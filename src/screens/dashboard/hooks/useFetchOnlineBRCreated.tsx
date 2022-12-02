import { BUSINESS_RESULT_CART_NAME, ONLINE_BUSINESS_RESULT_CREATED_QUERY } from "config/dashboard";
import { BusinessResultCartItem } from "model/dashboard/dashboard.model";
import { ArrayAny } from "model/report/analytics.model";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getDataOneQueryDashboard } from "utils/DashboardUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showErrorReport } from "utils/ReportUtils";
import { DashboardContext } from "../provider/dashboard-provider";

function useFetchOnlineBRCreated() {
  const dispatch = useDispatch();
  const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } =
    useContext(DashboardContext);
  const [isFetchingOnlineBRCreated, setIsFetchingOnlineBRCreated] = useState<boolean>(false);

  useEffect(() => {
    const fetchTotalSaleComplete = async () => {
      setIsFetchingOnlineBRCreated(true);
      const response = await getDataOneQueryDashboard(
        dispatch,
        showMyData,
        deparmentIdList,
        ONLINE_BUSINESS_RESULT_CREATED_QUERY,
      );
      setIsFetchingOnlineBRCreated(false);

      if (!response) {
        showErrorReport("Lỗi lấy dữ liệu kết quả kinh doanh ĐT Online");
        return;
      }

      const today = moment().format(DATE_FORMAT.YYYYMMDD);

      let totalSalesDailyActual = 0;
      let totalSalesMonthlyActual = 0;
      let ordersDailyActual = 0;
      let ordersMonthlyActual = 0;

      response.result.data.forEach((value: ArrayAny) => {
        // Luỹ kế tháng
        totalSalesMonthlyActual += Number(value[1]);
        ordersMonthlyActual += Number(value[2]);

        // Doanh thu hôm nay
        if (moment.parseZone(value[0]).utc(true).format(DATE_FORMAT.YYYYMMDD) === today) {
          totalSalesDailyActual += Number(value[1]);
          ordersDailyActual += Number(value[2]);
        }
      });

      // save data source
      setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
        const newState = new Map(prevState);
        newState.set(BUSINESS_RESULT_CART_NAME.onlinePreTotalSales, {
          value: totalSalesDailyActual,
          monthlyAccumulated: totalSalesMonthlyActual,
        });
        newState.set(BUSINESS_RESULT_CART_NAME.onlinePreOrders, {
          value: ordersDailyActual,
          monthlyAccumulated: ordersMonthlyActual,
        });
        return newState;
      });
    };
    fetchTotalSaleComplete();
  }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData]);

  return { isFetchingOnlineBRCreated };
}

export default useFetchOnlineBRCreated;
