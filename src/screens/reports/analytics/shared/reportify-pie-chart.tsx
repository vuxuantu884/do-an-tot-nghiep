import Color from "assets/css/export-variable.module.scss";
import { FIELD_FORMAT } from "model/report/analytics.model";
import React from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardContainer } from "screens/dashboard/index.style";
import { formatCurrency } from "utils/AppUtils";

const { primary, secondary } = Color;

type Props = {
    data: any,
    legends: any[],
}

function ReportifyPieChart(props: Props) {
    const { data, legends } = props;
    return (
        <div>
            <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                    <Legend wrapperStyle={{ paddingTop: "0px" }} payload={
                        legends.filter(item => item.value).map(
                            (item, index) => ({
                                id: item.id,
                                type: item.type,
                                value: item.value,
                                color: index === 0 ? primary : secondary
                            })
                        )
                    } />
                    <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(243, 243, 247, 0.6)' }} />
                    <Pie data={data.pieChart1} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill={primary} name={'htm'} />
                    <Pie data={data.pieChart2} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={100} outerRadius={160} fill={secondary} name={'htm2'} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

function TooltipContent(data: any) {
    const { active, payload } = data;
    if (active && payload && payload.length) {
        return (
            <DashboardContainer>
                <div className="monthly-chart__tooltip">
                    {payload.map((item: any, index: number) => (
                        <div>
                            <p className="tooltip-title">{item.payload?.label}</p>
                            <span style={{ color: item?.color || "black" }} key={index}>
                                {`${typeof item.name === "string" ? (item.name + ": ") : ""}`}
                                {item.payload?.unit === FIELD_FORMAT.Price ? `${formatCurrency(parseFloat(item.value).toFixed(2))}₫` : item.value}<br />
                            </span>
                        </div>
                    ))}
                </div>
            </DashboardContainer>
        );
    }

    return null;
};

export default ReportifyPieChart