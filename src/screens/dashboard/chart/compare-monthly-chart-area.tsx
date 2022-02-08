import { Col, Row } from "antd";
import LegendLinePrimary from "assets/icon/legend-line-primary.svg";
import LegendLineRed from "assets/icon/legend-line-red.svg";
import { IncomeChart } from "model/dashboard/dashboard.model";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "utils/AppUtils";
import { ChartColor } from "../index.style";
import { CustomizedXAxisTickMonthly, CustomizedYAxisTickMonthly, CustomTooltip } from "../shared";

enum DataKey {
  current_month = "current_month",
  average_of_previous_three_month = "average_of_previous_three_month",
  day_of_month = "day_of_month",
}

const labelName = {
  [DataKey.current_month]: "Tháng này",
  [DataKey.average_of_previous_three_month]: "Trung bình 3 tháng trước",
};

function CompareMonthlyChartArea(props: IncomeChart) {
  const { month_income_list, income_of_today } = props;

  return (
    <div>
      <Row className="monthly-chart__info">
        <Col span={16}>
          <p className="title">Doanh thu thành công theo ngày trong tháng</p>
          <div className="monthly-chart__currency">
            <span className="price">{formatCurrency(income_of_today)}&nbsp;</span>
            <span className="day">(Hôm nay)</span>
          </div>
        </Col>
        <Col span={8}>
          <div className="guild">
            <div>
              <img src={LegendLineRed} alt="" /> &nbsp;Tháng này
            </div>
            <div>
              <img src={LegendLinePrimary} alt="" /> &nbsp;Trung bình 3 tháng trước
            </div>
          </div>
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={month_income_list} margin={{ top: 10, right: 0, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.cinnabar} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="color3Month" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.primary} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={DataKey.day_of_month}
            tickLine={false}
            padding={{ left: 4, right: 0 }}
            tick={<CustomizedXAxisTickMonthly />}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickFormatter={(label) => label}
            tickLine={false}
            tick={<CustomizedYAxisTickMonthly />}
          />
          <CartesianGrid vertical={false} />
          <Tooltip content={<CustomTooltip labelName={labelName} />} />

          <Area
            type="monotone"
            dataKey={DataKey.current_month}
            stroke={ChartColor.cinnabar}
            fillOpacity={1}
            fill="url(#colorCurrent)"
            dot={{ stroke: ChartColor.cinnabar, fill: ChartColor.cinnabar, strokeWidth: 1, r: 3 }}
          />
          <Area
            type="monotone"
            dataKey={DataKey.average_of_previous_three_month}
            stroke={ChartColor.primary}
            fillOpacity={1}
            fill="url(#color3Month)"
            dot={{ stroke: ChartColor.primary, fill: ChartColor.primary, strokeWidth: 1, r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CompareMonthlyChartArea;
