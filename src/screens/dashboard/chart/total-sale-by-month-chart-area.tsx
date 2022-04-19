import { Col, Row } from "antd";
import LegendLinePrimary from "assets/icon/legend-line-primary.svg";
import LegendLineRed from "assets/icon/legend-line-red.svg";
import { BUSINESS_RESULT_CHART_LABEL } from "config/dashboard";
import { BusinessResultChart, DayTotalSale } from "model/dashboard/dashboard.model";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "utils/AppUtils";
import { ChartColor } from "../index.style";
import { CustomizedXAxisTickMonthly, CustomizedYAxisTickMonthly } from "../shared";


function TotalSaleByMonthChartArea(props: BusinessResultChart) {
  const { monthTotalSalesOverDay, totalSalesToday } = props;

  return (
    <div>
      <Row className="monthly-chart__info">
        <Col span={16}>
          <p className="title">Doanh thu thành công theo ngày trong tháng</p>
          <div className="monthly-chart__currency">
            <span className="price">{formatCurrency(totalSalesToday)}&nbsp;</span>
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
        <AreaChart data={monthTotalSalesOverDay} margin={{ top: 10, right: 0, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.cinnabar} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="color3Month" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.primary} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={(data: DayTotalSale) => data.day}
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
          <Tooltip content={<TooltipContent />} cursor={{fill: 'rgba(243, 243, 247, 0.6)'}} />

          <Area
            type="monotone"
            dataKey={(data: DayTotalSale) => data.currentMonth}
            stroke={ChartColor.cinnabar}
            fillOpacity={1}
            fill="url(#colorCurrent)"
            dot={{ stroke: ChartColor.cinnabar, fill: ChartColor.cinnabar, strokeWidth: 1, r: 3 }}
            name={BUSINESS_RESULT_CHART_LABEL.CURRENT_MONTH}
          />
          <Area
            type="monotone"
            dataKey={(data: DayTotalSale) => data.averageOfLastThreeMonth}
            stroke={ChartColor.primary}
            fillOpacity={1}
            fill="url(#color3Month)"
            dot={{ stroke: ChartColor.primary, fill: ChartColor.primary, strokeWidth: 1, r: 3 }}
            name={BUSINESS_RESULT_CHART_LABEL.AVERAGE_OF_LAST_3_MONTH}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TooltipContent(data: any) {
  const { active, payload, label } = data;
  if (active && payload && payload.length) {

    return (
      <div className="monthly-chart__tooltip">
        <p className="tooltip-title">Ngày: {label}</p>
        {payload.map((item: any, index: number) => (
          <span style={{ color: item?.color || "black" }} key={index}>
            {`${typeof item.name === "string" ? (item.name + ": ") : ""}`}
            {`${formatCurrency(parseFloat(item.value).toFixed(2))}₫`}<br />
          </span>
        ))}
      </div>
 
    );
  }

  return null;
};
export default TotalSaleByMonthChartArea;
