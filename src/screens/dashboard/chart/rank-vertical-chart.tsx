import { RankIncomeItem } from 'model/dashboard/dashboard.model';
import React, { ReactElement } from 'react';
import { Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currencyAbbreviation } from 'utils/DashboardUtils';
import { ChartColor } from '../index.style';
import { CustomizedYAxisTickRankUserImcome, CustomTooltip } from '../shared';
import { RankChartStyle } from './rank-chart.style';
import { DataKey, labelName } from "./rank-hirizontal-chart";
interface Props {
    title: string;
    subTitle: string;
    data: Array<RankIncomeItem>;
    legendPrimary: string;
    legendSecondary: string;
}
 

 
RankVerticalChart.defaultProps = {
    title: 'Bảng thi đua nhân viên',
    subTitle: 'Top 5 nhân viên có doanh thu cao nhất', 
    legendPrimary: 'Doanh thu bán lẻ',
    legendSecondary: 'Giá trị trung bình/Hóa đơn'
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
                width={500}
                height={400}
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 0
                }}
            >   <YAxis
                    dataKey={DataKey.label}
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    scale="band"
                    tick={<CustomizedYAxisTickRankUserImcome userRanks={data} />}
                    width={80}
                />

                <XAxis dataKey={DataKey.retail_income}
                    type="number" tickLine={false}
                    xAxisId="top" orientation="top"
                    stroke={ChartColor.primary}
                    tickFormatter={(value) => {
                        return currencyAbbreviation(value)
                    }}

                />
                <XAxis dataKey={DataKey.average_of_retail_income}
                    type="number" tickLine={false}
                    xAxisId="bottom" orientation="bottom"
                    stroke={ChartColor.secondary}
                    tickFormatter={(value) => {
                        return currencyAbbreviation(value)
                    }}
                />
                <Tooltip content={<CustomTooltip labelName={labelName} />} />
                <Bar dataKey={DataKey.retail_income} barSize={20} xAxisId="top" fill={ChartColor.primary} />
                <Bar dataKey={DataKey.average_of_retail_income} barSize={20} xAxisId="bottom" fill={ChartColor.secondary} />
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
