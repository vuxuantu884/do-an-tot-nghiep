import { BUSINESS_RESULT_CART_NAME, BUSINESS_RESULT_QUERY_TOTAL_SALES_COMPLETED, DASHBOARD_CONFIG, ReportDatavalue } from 'config/dashboard'
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model'
import { AnalyticDataQuery, ArrayAny } from 'model/report/analytics.model'
import moment from 'moment'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { executeAnalyticsQueryService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { setDepartmentQuery } from 'utils/DashboardUtils'
import { DATE_FORMAT } from 'utils/DateUtils'
import { generateRQuery } from 'utils/ReportUtils'
import { showError } from 'utils/ToastUtils'
import { DashboardContext } from '../provider/dashboard-provider'


function useFetchBusinessResultComplete() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList } = useContext(DashboardContext)
    const [isFetchingBusinessResultComplete, setIsFetchingBusinessResultComplete] = useState<boolean>(false);

    useEffect(() => {
        const fetchTotalSaleComplete = async () => {
            BUSINESS_RESULT_QUERY_TOTAL_SALES_COMPLETED.query.conditions = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
            const q = generateRQuery(BUSINESS_RESULT_QUERY_TOTAL_SALES_COMPLETED.query);
            setIsFetchingBusinessResultComplete(true);
            const response: AnalyticDataQuery = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q });
            setIsFetchingBusinessResultComplete(false);
            if (!response) {
                showError("Lỗi lấy dữ liệu doanh thu");
                return;
            }

            const today = moment().format(DATE_FORMAT.YYYYMMDD)
            /**
             * Cột 1(index = 0): Ngày
             * Cột 2(index = 1): Khối kinh doanh
             * Cột 3(index = 2): Doanh thu
             * Cột 4(index = 3): Tổng trả 
             */

            // Doanh thu online
            // const totalSalesOnline = data[0].result.data.find((item: ArrayAny) => item[0] === ReportDatavalue.KD_ONLINE);

            let accumulateSalesOnline = 0
            let salesOnlineToday = 0

            let accumulateSalesOffline = 0
            let salesOfflineToday = 0

            response.result.data.forEach((value: ArrayAny) => {
                // ONLINE 
                if (value[1] === ReportDatavalue.KD_ONLINE) {
                    // Luỹ kế tháng
                    accumulateSalesOnline += Number(value[2]);

                    // Doanh thu online hôm nay
                    if (moment(value[0]).format(DATE_FORMAT.YYYYMMDD) === today) {
                        salesOnlineToday += Number(value[2]);
                    }
                }

                // OFFLINE
                if (value[1] === ReportDatavalue.KD_OFFLINE) {
                    // Luỹ kế tháng
                    accumulateSalesOffline += Number(value[2]);
                    if (moment(value[0]).format(DATE_FORMAT.YYYYMMDD) === today) {
                        salesOfflineToday += Number(value[2]);
                    }
                }
            })

            // Doanh thu trả hàng
            const accumulateReturn = response.result.summary[2];

            let returnToday = 0;
            response.result.data.forEach((value: ArrayAny) => {
                if (moment(value[0]).format(DATE_FORMAT.YYYYMMDD) === today) {
                    returnToday += Number(value[3]);
                }
            })

            // save data source
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.online, { value: salesOnlineToday, monthlyAccumulated: accumulateSalesOnline });
                newState.set(BUSINESS_RESULT_CART_NAME.offline, { value: salesOfflineToday, monthlyAccumulated: accumulateSalesOffline });
                newState.set(BUSINESS_RESULT_CART_NAME.return, { value: returnToday, monthlyAccumulated: accumulateReturn });

                return newState;
            })
        }
        fetchTotalSaleComplete();

    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList])

    return { isFetchingBusinessResultComplete }
}

export default useFetchBusinessResultComplete