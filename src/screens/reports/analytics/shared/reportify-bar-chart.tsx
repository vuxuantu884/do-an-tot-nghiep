import Color from "assets/css/export-variable.module.scss";
import { FIELD_FORMAT } from "model/report/analytics.model";
import React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardContainer } from "screens/dashboard/index.style";
import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from 'utils/DashboardUtils';

const { primary, secondary } = Color;

type Props = {
    data: any,
    leftLegendName?: string,
    rightLegendName?: string,
    chartColumnNumber: number,
    leftTickFormat?: string,
    rightTickFormat?: string,
}

function ReportifyBarChart(props: Props) {
    const { data, leftLegendName, rightLegendName, chartColumnNumber, leftTickFormat, rightTickFormat } = props;
    return (
        <div>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                margin={{
                    top: 15,
                    right: 0,
                    left: 0,
                    bottom: 15,
                }}
                barCategoryGap={0}
                barGap={0}
                barSize={50}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={(value) => value.map((item: string) => {
                        return item || '-';
                    })[0]}
                    textAnchor="end"
                    dx={30}
                    interval="preserveStartEnd"
                    dy={15}
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
                        return currencyAbbreviation(value, leftTickFormat ? leftTickFormat : undefined);
                    }}
                    allowDecimals={false}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={secondary}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                        return currencyAbbreviation(value, rightTickFormat ? rightTickFormat : undefined);
                    }}
                    allowDecimals={false}
                />
                <Tooltip content={<TooltipContent />} />
                {(leftLegendName || rightLegendName) && (
                    <>
                        <Legend wrapperStyle={{
                            paddingTop: "15px"
                        }} />
                    </>)}
                { chartColumnNumber > 1 && (
                    <Bar yAxisId="left" dataKey={(value) => value[value.length-2]} fill={primary} name={leftLegendName} unit={leftTickFormat} />
                )}
                <Bar yAxisId={chartColumnNumber > 1 ? "right" : "left"} dataKey={(value) => value[value.length-1]} fill={chartColumnNumber > 1 ? secondary : primary} name={rightLegendName} unit={rightTickFormat} />
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
                            {item.unit === FIELD_FORMAT.Price ? `${formatCurrency(parseFloat(item.value).toFixed(2))}₫` : item.value}<br />
                        </span>
                    ))}
                </div>
            </DashboardContainer>
        );
    }

    return null;
};
export default ReportifyBarChart