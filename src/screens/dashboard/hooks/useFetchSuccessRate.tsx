import { BUSINESS_RESULT_CART_NAME, BUSINESS_RESULT_SUCCESS_RATE_DAY_QUERY, BUSINESS_RESULT_SUCCESS_RATE_MONTH_QUERY } from 'config/dashboard'
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getDataOneQueryDashboard } from 'utils/DashboardUtils'
import { showErrorReport } from 'utils/ReportUtils'
import { DashboardContext } from '../provider/dashboard-provider'


function useFetchSuccessRate() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingSuccessRate, setIsFetchingSuccessRate] = useState<boolean>(false);


    useEffect(() => {
        const fetchingSuccessRate = async () => {
            setIsFetchingSuccessRate(true);

            const dataDay = await getDataOneQueryDashboard(dispatch, showMyData, deparmentIdList,
                BUSINESS_RESULT_SUCCESS_RATE_DAY_QUERY
            );
            const dataMonth = await getDataOneQueryDashboard(dispatch, showMyData, deparmentIdList,
                BUSINESS_RESULT_SUCCESS_RATE_MONTH_QUERY
            );

            setIsFetchingSuccessRate(false);
            if (!dataDay || !dataMonth) {
                showErrorReport("Lỗi lấy dữ liệu tỉ lệ thành công");
                return;
            }

            const successRateDay = dataDay.result;
            const successRateMonth = dataMonth.result;

            // save data source
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.successRate, { value: successRateDay.summary[0] ? +(100 * successRateDay.summary[1] / successRateDay.summary[0]).toFixed(0) : 0, monthlyAccumulated: successRateMonth.summary[0] ? +(100 * successRateMonth.summary[1] / successRateMonth.summary[0]).toFixed(0) : 0 });
                return newState;
            })
        }
        fetchingSuccessRate();

    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData])

    return { isFetchingSuccessRate }
}

export default useFetchSuccessRate