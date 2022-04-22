import { BUSINESS_RESULT_CANCELED_QUERY, BUSINESS_RESULT_CART_NAME } from 'config/dashboard'
import { BusinessResultCartItem, DashboardShowMyData } from 'model/dashboard/dashboard.model'
import { ArrayAny } from 'model/report/analytics.model'
import moment from 'moment'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getDataOneQueryDashboard } from 'utils/DashboardUtils'
import { DATE_FORMAT } from 'utils/DateUtils'
import { showErrorReport } from 'utils/ReportUtils'
import { DashboardContext } from '../provider/dashboard-provider'


function useFetchTotalSaleCanceled() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingTotalSaleCanceled, setIsFetchingTotalSaleCanceled] = useState<boolean>(false);


    useEffect(() => {
        const fetchTotalSaleComplete = async () => {
            
            setIsFetchingTotalSaleCanceled(true);
            const response = await getDataOneQueryDashboard(dispatch, {} as DashboardShowMyData, deparmentIdList, BUSINESS_RESULT_CANCELED_QUERY);
            
            setIsFetchingTotalSaleCanceled(false);
            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu hủy");
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