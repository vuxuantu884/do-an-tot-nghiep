import { Skeleton } from "antd";
import { formatCurrency } from "utils/AppUtils";

export interface IncomeBoxProps {
  title: string;
  value: number;
  monthlyAccumulated: number;
  type: "number" | "percent";
  loading: boolean;
  description?: string;
}
IncomeBox.defaultProps = {
  value: 0,
  monthlyAccumulated: 0,
  type: "number",
  loading: false,
};
function IncomeBox(props: IncomeBoxProps) {
  const { title, value, monthlyAccumulated, type, loading, description } = props;

  return (
    <div className="income-box">
      <span className="title">{title}</span>
      {description ? <span className="description">{description}</span> : ""}
      {loading ? (
        <>
          <br />
          <Skeleton.Input size={"small"} />
        </>
      ) : (
        <>
          <span className="value">{type === "percent" ? value + "%" : formatCurrency(value)}</span>
          <span className="conclusion">
            <span>Luỹ kế tháng: </span>
            <b>
              {type === "percent" ? monthlyAccumulated + "%" : formatCurrency(monthlyAccumulated)}
            </b>
          </span>
        </>
      )}
    </div>
  );
}

export default IncomeBox;
