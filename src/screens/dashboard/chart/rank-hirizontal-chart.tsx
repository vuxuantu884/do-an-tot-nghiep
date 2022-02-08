import { RankIncomeItem } from "model/dashboard/dashboard.model";
import React, { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currencyAbbreviation } from "utils/DashboardUtils";
import { ChartColor } from "../index.style";
import { CustomTooltip } from "../shared";
import { RankChartStyle } from "./rank-chart.style";

export enum DataKey {
  retail_income = "retail_income",
  average_of_retail_income = "average_of_retail_income",
  label = "label",
}

export const labelName = {
  [DataKey.retail_income]: "Doanh thu",
  [DataKey.average_of_retail_income]: "Trung bình hoá đơn",
};

interface Props {
  title: string;
  subTitle: string;
  data: Array<RankIncomeItem>;
  legendPrimary: string;
  legendSecondary: string;
}

RankHorizontalChart.defaultProps = {
  title: "Bảng thi đua giữa các shop",
  subTitle: "Top 5 cửa hàng có doanh thu cao nhất tháng",
  legendPrimary: "Doanh thu bán lẻ",
  legendSecondary: "Giá trị trung bình/Hóa đơn",
};

function RankHorizontalChart(props: Props): ReactElement {
  const { title, subTitle, data, legendPrimary, legendSecondary } = props;
  return (
    <RankChartStyle>
      <div>
        <div className="rank-chart">
          <h3>{title}</h3>
          <p className="rank-chart__sub-title">{subTitle}</p>
        </div>
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
              dataKey={DataKey.label}
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
              stroke={ChartColor.primary}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                return value > 0 ? currencyAbbreviation(value) : "";
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={ChartColor.secondary}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                return value > 0 ? currencyAbbreviation(value) : "";
              }}
            />
            <Tooltip content={<CustomTooltip labelName={labelName} />} />
            <Bar yAxisId="left" dataKey={DataKey.retail_income} fill={ChartColor.primary} />
            <Bar yAxisId="right" dataKey={DataKey.average_of_retail_income} fill={ChartColor.secondary} />
          </BarChart>
        </ResponsiveContainer>
        <div className="rank-chart__legend">
          <div className="rank-chart__legend-item">
            <div className="rank-chart__legend-item--primary"></div>
            <p>&nbsp;{legendPrimary}</p>
          </div>
          <div className="rank-chart__legend-item">
            <div className="rank-chart__legend-item--secondary"></div>
            <p>&nbsp;{legendSecondary}</p>
          </div>
        </div>
      </div>
    </RankChartStyle>
  );
}

export default RankHorizontalChart;
