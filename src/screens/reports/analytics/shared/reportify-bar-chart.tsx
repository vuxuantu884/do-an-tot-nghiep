import Color from "assets/css/export-variable.module.scss";
import { FIELD_FORMAT } from "model/report/analytics.model";
import React, { useContext } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardContainer } from "screens/dashboard/index.style";
import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from 'utils/DashboardUtils';
import { getTranslatePropertyKey } from "utils/ReportUtils";
import { AnalyticsContext } from "./analytics-provider";

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
    const { metadata, rowsInQuery } = useContext(AnalyticsContext);
    const { data, leftLegendName, rightLegendName, chartColumnNumber, leftTickFormat, rightTickFormat } = props;
    const xAxislabel = rowsInQuery.map((field: string) => {
        return metadata ? getTranslatePropertyKey(metadata, field) : field;
    }).join(' | ');
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
                    dataKey={(value: string[]) => value.filter((item: string, index) => index < rowsInQuery.length).reduce((res: string, item: string) => {
                        if (item) {
                            return res ? `${res} | ${item}` : `${item}`;
                        } else {
                            return res ? `${res} | -` : `-`;
                        }
                    }, '')}
                    textAnchor="end"
                    dx={30}
                    interval="preserveStartEnd"
                    dy={15}
                    tickLine={false}
                    fontSize={12}
                    style={{opacity: 0}}
                    label={{ value: xAxislabel, position: 'insideBottomCenter', offset: 10 }}
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
                <Tooltip content={<TooltipContent />} cursor={{fill: 'rgba(243, 243, 247, 0.6)'}} />
                {(leftLegendName || rightLegendName) && (
                    <>
                        <Legend wrapperStyle={{
                            paddingTop: "0px"
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