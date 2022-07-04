import { BUSINESS_RESULT_CART_NAME, BUSINESS_RESULT_CONVERSION_RATE_QUERY } from 'config/dashboard'
import { BusinessResultCartItem } from 'model/dashboard/dashboard.model'
import { ArrayAny } from 'model/report/analytics.model'
import { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getDataOneQueryDashboard } from 'utils/DashboardUtils'
import { showErrorReport } from 'utils/ReportUtils'
import { DashboardContext } from '../provider/dashboard-provider'


function useFetchConversionRate() {
    const dispatch = useDispatch();
    const { setDataSrcBusinessResultCard, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingConversionRate, setIsFetchingConversionRate] = useState<boolean>(false);


    useEffect(() => {
        const fetchTotalSaleComplete = async () => {
            setIsFetchingConversionRate(true);

            const data = await getDataOneQueryDashboard(dispatch, showMyData, deparmentIdList, BUSINESS_RESULT_CONVERSION_RATE_QUERY);

            setIsFetchingConversionRate(false);
            if (!data) {
                showErrorReport("Lỗi lấy dữ liệu tỉ lệ chuyển đổi");
                return;
            }

            let accumulate = 0
            let conversionRateMilstone = 0

            let successMilestone = 5
            const days = data.result.data.length

            // tỉ lệ thành công  = Doanh thu thành công / tổng doanh thu tạo trong 5 ngày gần nhất
            if (days < successMilestone) {
                successMilestone = days
            }
            for (let index = 0; index < successMilestone; index++) {
                const value = data.result.data[index];
                conversionRateMilstone += Number(value[1] || 0);
            }

            data.result.data.forEach((value: ArrayAny) => {
                // Luỹ kế tháng
                accumulate += Number(value[1] || 0);
            })

            const accRate = days ? Math.round(accumulate / days) : 0;

            // save data source
            setDataSrcBusinessResultCard((prevState: Map<string, BusinessResultCartItem>) => {
                const newState = new Map(prevState);
                newState.set(BUSINESS_RESULT_CART_NAME.conversionRate, { value: conversionRateMilstone / successMilestone, monthlyAccumulated: accRate });
                return newState;
            })
        }
        fetchTotalSaleComplete();

    }, [dispatch, setDataSrcBusinessResultCard, deparmentIdList, showMyData])

    return { isFetchingConversionRate }
}

export default useFetchConversionRate