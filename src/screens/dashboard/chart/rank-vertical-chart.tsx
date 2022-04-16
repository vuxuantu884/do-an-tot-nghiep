import { DashboardTopSale } from 'model/dashboard/dashboard.model';
import React, { ReactElement } from 'react';
import { Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currencyAbbreviation } from 'utils/DashboardUtils';
import { ChartColor } from '../index.style';
import { TooltipContentRankChart } from '../shared';
import { RankChartStyle } from './rank-chart.style';
interface Props {
    title: string;
    subTitle: string;
    data: Array<DashboardTopSale>;
    legendPrimary: string;
    legendSecondary: string;
}



RankVerticalChart.defaultProps = {
    title: 'Bảng thi đua nhân viên',
    subTitle: 'Top 5 nhân viên có doanh thu cao nhất',
    legendPrimary: 'Doanh thu',
    legendSecondary: 'GTTB/Hóa đơn'
}
function RankVerticalChart(props: Props): ReactElement {
    const { title, subTitle, data, legendPrimary, legendSecondary } = props;
    return (
        <RankChartStyle>
            <div className='rank-chart'>
                <h3 >{title}</h3>
                <p className='rank-chart__sub-title'>{subTitle}</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart
                    layout="vertical"
                    data={data}
                    margin={{
                        top: 0,
                        right: 10,
                        bottom: 20,
                        left: 10
                    }}
                    barSize={50}
                >   <YAxis
                        dataKey={(data: DashboardTopSale) => data.label?.toLocaleUpperCase()}
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        scale="band"
                    // tick={<CustomizedYAxisTickRankUserImcome userRanks={data} />}
                    // width={80}
                    />

                    <XAxis
                        dataKey={(data: DashboardTopSale) => data.totalSales}
                        type="number" tickLine={false}
                        xAxisId="top" orientation="top"
                        stroke={ChartColor.primary}
                        tickFormatter={(value) => {
                            return currencyAbbreviation(value)
                        }}

                    />
                    <XAxis
                        dataKey={(data: DashboardTopSale) => data.averageOrder}
                        type="number" tickLine={false}
                        xAxisId="bottom" orientation="bottom"
                        stroke={ChartColor.secondary}
                        tickFormatter={(value) => {
                            return currencyAbbreviation(value)
                        }}
                    />
                    <Tooltip content={<TooltipContentRankChart />} />
                    <Bar dataKey={(data: DashboardTopSale) => data.totalSales} xAxisId="top" fill={ChartColor.primary} name={legendPrimary} />
                    <Bar dataKey={(data: DashboardTopSale) => data.averageOrder} xAxisId="bottom" fill={ChartColor.secondary} name={legendSecondary} />
                </ComposedChart>
            </ResponsiveContainer>

            <div className='rank-chart__legend'>
                <div className='rank-chart__legend-item'>
                    <div className='rank-chart__legend-item--primary'>
                    </div><p>&nbsp;{legendPrimary}</p>
                </div>
                <div className='rank-chart__legend-item'>
                    <div className='rank-chart__legend-item--secondary'>
                    </div><p>&nbsp;{legendSecondary}</p>
                </div>
            </div>

        </RankChartStyle>
    )
}

export default RankVerticalChart
