import { Col, Row } from "antd";
import LegendLinePrimary from "assets/icon/legend-line-primary.svg";
import LegendLineRed from "assets/icon/legend-line-red.svg";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from "utils/DashboardUtils";
import { ChartColor } from "../index.style";


const getSampleData = () => {
  const data = [];
  for (let i = 1; i <= 31; i++) {
    data.push({
      name: i,
      uv: i > 15 ? null : 10000000 * Math.random(),
      pv: 10000000 * Math.random()
    });
  }
  return data;
};

interface CompareMonthly {
  currentMonth: number;
  averageOfPrevious3Month: number;
  dayOfMonth: number;

}

interface Props {
  data: Array<CompareMonthly>;
  incomeOfToday: number;
}


CompareMonthlyChartArea.defaultProps = {
  data: getSampleData(),
  incomeOfToday: 1900000000
}

function CompareMonthlyChartArea(props: Props) {
  const { data, incomeOfToday } = props;

  const CustomizedXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const { value } = payload;
    console.log(typeof value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          y={value % 2 !== 0 ? 10 : 30}
          textAnchor="start"
          fontFamily={"sans-serif"}
          fill={ChartColor.black}
          fontSize="14px"
        >
          {value.toString().padStart(2, "0")}
        </text>
      </g>
    );
  };

  const CustomizedYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const { value } = payload;
    return (
      <g transform={`translate(${x},${y + 5})`}>
        <text textAnchor="start" fontFamily={"sans-serif"} fill={ChartColor.black} fontSize="14px">
          {value > 0 ? currencyAbbreviation(value) : ""}
        </text>
      </g>
    );
  };
  const CustomTooltip = (data: any) => {
    const { active, payload, } = data;
    if (active && payload && payload.length) {
      return (
        <div className="monthly-chart__tooltip">
          {payload.map((item: any) => (
            <span className="label">{`${item.dataKey} : ${parseFloat(item.value).toFixed(2)}`}<br /></span>
          ))}
        </div>
      );
    }

    return null;
  };
  return (
    <div>
      <Row className="monthly-chart__info">
        <Col span={16}>
          <p className="title">
            Doanh thu thành công theo ngày trong tháng
          </p>
          <div className="monthly-chart__currency">
            <span className="price">
              {formatCurrency(incomeOfToday)}&nbsp;
            </span>
            <span className="day">
              (Hôm nay)
            </span>
          </div>
        </Col>
        <Col span={8}>
          <div className="guild">
            <div><img src={LegendLineRed} alt="" /> &nbsp;Tháng này</div>
            <div><img src={LegendLinePrimary} alt="" /> &nbsp;Trung bình 3 tháng trước</div>
          </div>
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.cinnabar} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.primary} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tickLine={false}
            padding={{ left: 4, right: 0 }}
            tick={<CustomizedXAxisTick />}
          />
          <YAxis
            orientation="right"
            axisLine={false}
            tickFormatter={(label) => label}
            tickLine={false}
            tick={<CustomizedYAxisTick />}
          />
          <CartesianGrid vertical={false} />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="uv"
            stroke={ChartColor.cinnabar}
            fillOpacity={1}
            fill="url(#colorUv)"
            dot={{ stroke: ChartColor.cinnabar, fill: ChartColor.cinnabar, strokeWidth: 1, r: 3 }}
          />
          <Area
            type="monotone"
            dataKey="pv"
            stroke={ChartColor.primary}
            fillOpacity={1}
            fill="url(#colorPv)"
            dot={{ stroke: ChartColor.primary, fill: ChartColor.primary, strokeWidth: 1, r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export default CompareMonthlyChartArea;
