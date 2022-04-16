import { DashboardTopSale } from "model/dashboard/dashboard.model";
import React, { ReactElement } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currencyAbbreviation } from "utils/DashboardUtils";
import { ChartColor } from "../index.style";
import { TooltipContentRankChart } from "../shared";
import { RankChartStyle } from "./rank-chart.style";


interface Props {
  title: string;
  subTitle: string;
  data: Array<DashboardTopSale>;
  legendPrimary: string;
  legendSecondary: string;
}

RankHorizontalChart.defaultProps = {
  title: "Bảng thi đua giữa các shop",
  subTitle: "Top 5 cửa hàng có doanh thu cao nhất",
  legendPrimary: "Doanh thu",
  legendSecondary: "GTTB/Hóa đơn",
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
              dataKey={(data: DashboardTopSale) => data.label}
              angle={15}
              textAnchor="end"
              dx={30}
              interval={0}
              dy={15}
              minTickGap={-200}
              tickLine={false}
              fontSize={12}
              display="none"
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
            <Tooltip content={<TooltipContentRankChart />} />

            <Bar
              yAxisId="left"
              dataKey={(data: DashboardTopSale) => data.totalSales}
              fill={ChartColor.primary}
              name={legendPrimary}
            />
            <Bar yAxisId="right" dataKey={(data: DashboardTopSale) => data.averageOrder}
              fill={ChartColor.secondary}
              name={legendSecondary}
            />
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
