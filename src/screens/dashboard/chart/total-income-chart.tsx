import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currencyAbbreviation } from 'utils/DashboardUtils';
import { ChartColor } from '../index.style';
import { CustomizedXAxisTickMonthly, CustomTooltip } from '../shared';

enum LabelTotalIncome {
    online = 'online',
    offline = 'offline',
    label = 'label'
}

const labelName = {
    [LabelTotalIncome.online]: 'Online',
    [LabelTotalIncome.offline]: 'Offline',
}

interface TotalInComeOnlineAndOffline {
    label: string;
    online: number;
    offline: number;
}

interface Props {
    title: string;
    subTitle: string;
    data: Array<TotalInComeOnlineAndOffline>;

}
const getSampleData = () => {
    const data = [];
    for (let i = 1; i <= 31; i++) {
        data.push({
            label: i,
            online: 100000000000 * Math.random(),
            offline: 100000000000 * Math.random()
        });
    }
    return data;
};

TotalIncomeChart.defaultProps = {
    title: 'Bảng thi đua nhân viên',
    subTitle: 'Top 5 nhân viên có doanh thu cao nhất',
    data: getSampleData(),

}

function TotalIncomeChart(props: Props) {
    const { data} = props;
    return (
        <div>
            <ResponsiveContainer width="100%" height={200}>

                <AreaChart                    
                    data={data}
                    margin={{
                        top: 0,
                        right: 15,
                        left: 0,
                        bottom: 15
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey={LabelTotalIncome.label}

                        tickLine={false} stroke="#000"
                        tick={<CustomizedXAxisTickMonthly />}

                    />
                    <YAxis stroke="#000" tickLine={false} axisLine={false} tickFormatter={(value) => {
                        return currencyAbbreviation(value)
                    }} />
                    <Tooltip content={<CustomTooltip labelName={labelName} />} />

                    <Area

                        dataKey={LabelTotalIncome.offline}
                        stackId="1"
                        fill={ChartColor.primary}
                    />
                    <Area
                        dataKey={LabelTotalIncome.online}
                        stackId="1"
                        stroke={ChartColor.secondary}
                        fill={ChartColor.secondary}
                    />
                    {/* <Legend iconType='rect' /> */}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default TotalIncomeChart
