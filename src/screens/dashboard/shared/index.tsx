import Top1SVG from "assets/icon/top-1-rank-income.svg";
import { formatCurrency } from "utils/AppUtils";
import { currencyAbbreviation } from "utils/DashboardUtils";
import { ChartColor } from "../index.style";
import { DashboardContainer } from "../index.style";

export const CustomTooltip = (data: any) => {
    const { active, payload, label, labelName } = data;

    if (active && payload && payload.length) {
        return (
            <DashboardContainer>
                <div className="monthly-chart__tooltip">
                    <p className="tooltip-title">{label}</p>
                    {payload.map((item: any) => (
                        <span style={{ color: item?.color || "black" }}>{`${labelName[item.dataKey]} : ${formatCurrency(parseFloat(item.value).toFixed(2))}₫`}<br /></span>
                    ))}
                </div>
            </DashboardContainer>
        );
    }

    return null;
};
export const CustomTooltipUserRank = (data: any) => {
    const { active, payload, label, labelName } = data;


    if (active && payload && payload.length) {
        console.log(payload)
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

export const CustomizedYAxisTickRankUserImcome = (props: any) => {
    const { x, y, payload, userRanks } = props;
    const { value } = payload;
    console.log(props)
    return (
        <g transform={`translate(${x - 70},${y - 10})`} >
            {userRanks[0].label === value && <image xlinkHref={Top1SVG} transform={`translate(${x - 20},${y - 85})`} />}
            <text textAnchor="start" fontFamily={"sans-serif"} fill={ChartColor.black} fontSize="14px"
            >
                {value}
            </text>
        </g>
    );
};

export function TooltipContentRankChart(data: any) {
    const { active, payload, label } = data;
    if (active && payload && payload.length) {
        const { description, top } = payload[0].payload;
        return (
            <div className="monthly-chart__tooltip">
                <p className="tooltip-title">{top === 1 && <img src={Top1SVG} alt="top 1" />} &nbsp;{label ? label.toUpperCase() : ""}<br />
                    {description}
                </p>

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