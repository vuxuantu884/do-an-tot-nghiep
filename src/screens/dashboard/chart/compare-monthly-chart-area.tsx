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
import { ChartColor } from "../index.style";
import { CustomizedXAxisTickMonthly, CustomizedYAxisTickMonthly, CustomTooltip } from "../shared";

enum DataKey {
  currentMonth = "currentMonth",
  averageOfPrevious3Month = "averageOfPrevious3Month",
  label = "label"
}

const labelName = {
  [DataKey.currentMonth]: "Tháng này",
  [DataKey.averageOfPrevious3Month]: "Trung bình 3 tháng trước"
}

const getSampleData = () => {
  const data = [];
  for (let i = 1; i <= 31; i++) {
    data.push({
      label: i,
      currentMonth: i > 15 ? null : 10000000 * Math.random(),
      averageOfPrevious3Month: 10000000 * Math.random()
    });
  }
  return data;
};

interface CompareMonthly {
  currentMonth: number;
  averageOfPrevious3Month: number;
  label: string;
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
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.cinnabar} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="color3Month" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor={ChartColor.primary} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey={DataKey.label}
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
            dataKey={DataKey.currentMonth}
            stroke={ChartColor.cinnabar}
            fillOpacity={1}
            fill="url(#colorCurrent)"
            dot={{ stroke: ChartColor.cinnabar, fill: ChartColor.cinnabar, strokeWidth: 1, r: 3 }}
          />
          <Area
            type="monotone"
            dataKey={DataKey.averageOfPrevious3Month}
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
