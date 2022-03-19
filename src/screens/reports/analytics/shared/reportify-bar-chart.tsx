import Color from "assets/css/export-variable.module.scss";
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardContainer } from "screens/dashboard/index.style";
import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from 'utils/DashboardUtils';

const { primary, secondary } = Color;

type Props = {
    data: any,
    leftLegendName?: string,
    rightLegendName?: string
}

function ReportifyBarChart(props: Props) {
    const { data, leftLegendName, rightLegendName } = props;
    return (
        <div>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 15,
                }}
                barCategoryGap={0}
                barGap={0}
                barSize={50}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={(value) => value[0]}
                    angle={15}
                    textAnchor="end"
                    dx={30}
                    interval={0}
                    dy={15}
                    minTickGap={-200}
                    tickLine={false}
                    fontSize={12}
                />
                <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke={primary}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                        return value > 0 ? currencyAbbreviation(value) : "";
                    }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={secondary}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                        return value > 0 ? currencyAbbreviation(value) : "";
                    }}
                />
                <Tooltip content={<TooltipContent />} />
                {leftLegendName && rightLegendName && (
                    <>
                        <Legend />
                    </>)}
                <Bar yAxisId="left" dataKey={(value) => value[1]} fill={primary} name={leftLegendName} />
                <Bar yAxisId="right" dataKey={(value) => value[2]} fill={secondary} name={rightLegendName} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    )
}

function TooltipContent(data: any) {
    const { active, payload, label } = data;
    if (active && payload && payload.length) {

        return (
            <DashboardContainer>
                <div className="monthly-chart__tooltip">
                    <p className="tooltip-title">{label}</p>
                    {payload.map((item: any, index:number) => (
                        <span style={{ color: item?.color || "black" }} key={index}>
                            {`${typeof item.name === "string" ? (item.name + ": ") : ""}`}
                            {`${formatCurrency(parseFloat(item.value).toFixed(2))}₫`}<br />
                        </span>
                    ))}
                </div>
            </DashboardContainer>
        );
    }

    return null;
};
export default ReportifyBarChart