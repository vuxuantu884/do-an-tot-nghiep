import { BUSINESS_RESULT_CANCELED_QUERY, BUSINESS_RESULT_CART_NAME, DASHBOARD_CONFIG } from 'config/dashboard'
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


function useFetchTotalSaleCanceled() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingTotalSaleCanceled, setIsFetchingTotalSaleCanceled] = useState<boolean>(false);


    useEffect(() => {
        const fetchTotalSaleComplete = async () => {
            const { condition, isSeeMyData, myCode } = showMyData;
            // Data từ bộ lọc bộ phận
            const locationCondition = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
            // Data từ bộ lọc xem dữ liệu của tôi
            const userCondition: string[] | null = condition && isSeeMyData && myCode ? [condition, "==", myCode] : null;

            BUSINESS_RESULT_CANCELED_QUERY.query.conditions?.push(...locationCondition);
            userCondition && BUSINESS_RESULT_CANCELED_QUERY.query.conditions?.push(userCondition);
            const q = generateRQuery(BUSINESS_RESULT_CANCELED_QUERY.query);
            setIsFetchingTotalSaleCanceled(true);
            const response: AnalyticDataQuery = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q, options: BUSINESS_RESULT_CANCELED_QUERY.options });
            setIsFetchingTotalSaleCanceled(false);
            if (!response) {
                showError("Lỗi lấy dữ liệu doanh thu hủy");
                return;
            }

            const today = moment().format(DATE_FORMAT.YYYYMMDD)

            let accumulateSalesCanceled = 0
            let salesCanceledToday = 0


            response.result.data.forEach((value: ArrayAny) => {
                // Luỹ kế tháng
                accumulateSalesCanceled += Number(value[1] || 0);

                // Doanh thu online hôm nay
                if (moment(value[0]).format(DATE_FORMAT.YYYYMMDD) === today) {
                    salesCanceledToday += Number(value[1]);
                }
            })



            // save data source
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.cancel, { value: salesCanceledToday, monthlyAccumulated: accumulateSalesCanceled });
                return newState;
            })
        }
        fetchTotalSaleComplete();

    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData])

    return { isFetchingTotalSaleCanceled }
}

export default useFetchTotalSaleCanceled