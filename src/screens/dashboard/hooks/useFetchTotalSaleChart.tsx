

import { BUSINESS_RESULT_CHART_TEMPLATE, DASHBOARD_CONFIG } from 'config/dashboard/index';
import { DayTotalSale } from 'model/dashboard/dashboard.model';
import { AnalyticQueryMany, AnalyticSampleQuery, ArrayAny } from 'model/report/analytics.model';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { executeManyAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { setDepartmentQuery } from 'utils/DashboardUtils';
import { generateRQuery } from 'utils/ReportUtils';
import { showError } from 'utils/ToastUtils';
import { DashboardContext } from '../provider/dashboard-provider';
type AccumulateData = { sum: number, count: number, day: string }

function useFetchChartBusinessResult() {
    const dispatch = useDispatch();
    const { setDataSrcChartBusinessResult, setTotalSalesToday, deparmentIdList, showMyData } = useContext(DashboardContext)
    const [isFetchingChartData, setIsFetchingChartData] = useState<boolean>(false);

    useEffect(() => {
        const tempChartList: Array<DayTotalSale> = [];

        const fetchChartData = async () => {
            setIsFetchingChartData(true);
            const params: AnalyticQueryMany = { q: [], options: [] };

            const { condition, isSeeMyData, myCode } = showMyData;
            // Data từ bộ lọc bộ phận
            const locationCondition = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
            // Data từ bộ lọc xem dữ liệu của tôi
            const userCondition = condition && isSeeMyData && myCode ? [showMyData.condition, "==", myCode] : [];
            BUSINESS_RESULT_CHART_TEMPLATE.forEach((item: AnalyticSampleQuery) => {
                item.query.conditions = [...locationCondition, userCondition];
                const q = generateRQuery(item.query);
                params.q.push(q);
                params.options.push(item.options || "");
            })
            const data = await callApiNative({ isShowError: true }, dispatch, executeManyAnalyticsQueryService, params);
            setIsFetchingChartData(false);
            if (!data) {
                showError("Lỗi khi lấy dữ liệu biểu đồ kết quả kinh doanh");
                return;
            }
            // tính luỹ kế 3 tháng
            const accumulatedIncome = data[0].result.data.reduce((accumulator: Array<AccumulateData>, currentValue: ArrayAny) => {
                const day = moment(currentValue[0]).format("DD");
                const existedDay = accumulator.some((item: AccumulateData) => {
                    if (item.day === day) {
                        item.sum += Number(currentValue[1]);
                        item.count += 1;
                        return true;
                    } else {
                        return false;
                    }
                })
                if (!existedDay) {
                    accumulator.push({
                        day,
                        sum: Number(currentValue[1]),
                        count: 1
                    })
                }
                return accumulator;
            }, [] as Array<AccumulateData>)

            // doanh thu tháng hiện tại
            accumulatedIncome.forEach((item: AccumulateData, index: number) => {
                const dayData = data[1].result.data[index]
                const incomeOfDay = dayData ? dayData[1] : null;
                tempChartList.push({
                    day: item.day,
                    averageOfLastThreeMonth: item.sum / item.count,
                    currentMonth: incomeOfDay
                })
            })
            setDataSrcChartBusinessResult(tempChartList);
            // doanh thu hôm nay
            const todayData = data[1].result.data[Number(moment().format("D")) - 1];
            setTotalSalesToday(todayData ? todayData[1] : 0);
        }

        fetchChartData();
    }, [dispatch, setDataSrcChartBusinessResult, setTotalSalesToday, deparmentIdList, showMyData]);

    return { isFetchingChartData };
}

export default useFetchChartBusinessResult