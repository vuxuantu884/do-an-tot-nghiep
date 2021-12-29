import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from "utils/DashboardUtils";
import { ChartColor } from "../index.style";

export const CustomTooltip = (data: any) => {
    const { active, payload, label, labelName } = data;

    active && console.log(data)
    if (active && payload && payload.length) {
        return (
            <div className="monthly-chart__tooltip">
                <p className="tooltip-title">{label}</p>
                {payload.map((item: any) => (
                    <span style={{ color: item?.color || "black" }}>{`${labelName[item.dataKey]} : ${formatCurrency(parseFloat(item.value).toFixed(2))}₫`}<br /></span>
                ))}
            </div>
        );
    }

    return null;
};

export const CustomizedYAxisTickMonthly = (props: any) => {
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

export const CustomizedXAxisTickMonthly = (props: any) => {
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