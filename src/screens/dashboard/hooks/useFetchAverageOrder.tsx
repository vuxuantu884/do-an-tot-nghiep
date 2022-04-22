import { BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY, BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY, BUSINESS_RESULT_CART_NAME } from 'config/dashboard';
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataManyQueryDashboard } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';

function useFetchBRAverageOrder() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)

    const [isFetchingAverageOrder, setIsFetchingAverageOrder] = useState<boolean>(false);

    useEffect(() => {
        const fetchAverageOrder = async () => {
            setIsFetchingAverageOrder(true);

            const data = await getDataManyQueryDashboard(dispatch, showMyData, deparmentIdList,
                [BUSINESS_RESULT_AVG_ORDER_VALUE_TODAY_QUERY, BUSINESS_RESULT_AVG_ORDER_VALUE_CURRENT_MONTH_QUERY])

            setIsFetchingAverageOrder(false);
            if (!data) {
                showErrorReport("Lỗi khi lấy dữ liệu GTTB hoá đơn");
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
    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData])

    return { isFetchingAverageOrder }
}

export default useFetchBRAverageOrder