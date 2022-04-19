import { BUSINESS_RESULT_CART_NAME, BUSINESS_RESULT_SUCCESS_RATE_QUERY, DASHBOARD_CONFIG } from 'config/dashboard'
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model'
import { AnalyticDataQuery, ArrayAny } from 'model/report/analytics.model'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { executeAnalyticsQueryService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { setDepartmentQuery } from 'utils/DashboardUtils'
import { generateRQuery } from 'utils/ReportUtils'
import { showError } from 'utils/ToastUtils'
import { DashboardContext } from '../provider/dashboard-provider'


function useFetchSuccessRate() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingSuccessRate, setIsFetchingSuccessRate] = useState<boolean>(false);


    useEffect(() => {
        const fetchTotalSaleComplete = async () => {
            const { condition, isSeeMyData, myCode } = showMyData;
            // Data từ bộ lọc bộ phận
            const locationCondition = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
            // Data từ bộ lọc xem dữ liệu của tôi
            const userCondition: string[] | null = condition && isSeeMyData && myCode ? [condition, "==", myCode] : null;

            BUSINESS_RESULT_SUCCESS_RATE_QUERY.query.conditions?.push(...locationCondition);
            userCondition && BUSINESS_RESULT_SUCCESS_RATE_QUERY.query.conditions?.push(userCondition);
            const q = generateRQuery(BUSINESS_RESULT_SUCCESS_RATE_QUERY.query);
            setIsFetchingSuccessRate(true);
            const response: AnalyticDataQuery = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q, options: BUSINESS_RESULT_SUCCESS_RATE_QUERY.options });
            setIsFetchingSuccessRate(false);
            if (!response) {
                showError("Lỗi lấy dữ liệu doanh thu hủy");
                return;
            }

            let accumulate = 0
            let successRateMilstone = 0

            let successMilestone = 5
            const days = response.result.data.length

            // tỉ lệ thành công  = Doanh thu thành công / tổng doanh thu tạo trong 5 ngày gần nhất
            if (days < successMilestone) {
                successMilestone = days
            }
            for (let index = 0; index < successMilestone; index++) {
                const value = response.result.data[index];
                successRateMilstone += Number(value[1] || 0);
            }

            response.result.data.forEach((value: ArrayAny) => {
                // Luỹ kế tháng
                accumulate += Number(value[1] || 0);
            })

            const accRate = days ? Math.round(accumulate / days) : 0;

            // save data source
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.successRate, { value: successRateMilstone / successMilestone, monthlyAccumulated: accRate });
                return newState;
            })
        }
        fetchTotalSaleComplete();

    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData])

    return { isFetchingSuccessRate }
}

export default useFetchSuccessRate