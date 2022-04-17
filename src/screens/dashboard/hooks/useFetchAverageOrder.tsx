import { BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY, BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY, BUSINESS_RESULT_CART_NAME, DASHBOARD_CONFIG } from 'config/dashboard';
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model';
import { AnalyticDataQuery, AnalyticQueryMany, AnalyticSampleQuery } from 'model/report/analytics.model';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { executeManyAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { setDepartmentQuery } from 'utils/DashboardUtils';
import { generateRQuery } from 'utils/ReportUtils';
import { showError } from 'utils/ToastUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchBRAverageOrder() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList } = useContext(DashboardContext)

    const [isFetchingAverageOrder, setIsFetchingAverageOrder] = useState<boolean>(false);

    useEffect(() => {
        const fetchAverageOrder = async () => {
            setIsFetchingAverageOrder(true);
            const params: AnalyticQueryMany = { q: [], options: [] };


            [BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY,
                BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY].forEach((item: AnalyticSampleQuery) => {
                    // lọc theo cửa hàng 
                    item.query.conditions = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
                    const q = generateRQuery(item.query);
                    params.q.push(q);
                    params.options.push(item.options || "");
                })
            const data: AnalyticDataQuery[] = await callApiNative({ isShowError: true }, dispatch, executeManyAnalyticsQueryService, params);
            setIsFetchingAverageOrder(false);
            if (!data) {
                showError("Lỗi khi lấy dữ liệu biểu đồ kết quả kinh doanh");
                return;
            }
            const dataToday = data[0].result.data[0][0];
            const dataAccumulated = data[1].result.data[0][0];
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.averageOrder,
                    { value: dataToday, monthlyAccumulated: dataAccumulated });
                return newState;

            })
        }
        fetchAverageOrder()
    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList])

    return { isFetchingAverageOrder }
}

export default useFetchBRAverageOrder