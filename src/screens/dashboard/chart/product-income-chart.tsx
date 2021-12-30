import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { CustomTooltip } from "../shared";

enum ProductIncomeLabel {
    label = 'label',
    value = "value"
}
const labelName = {
    
    [ProductIncomeLabel.value]: "Doanh thu"
}
interface ProductInCome {
    label: string;
    value: number;
}

interface Props {
    data: Array<ProductInCome>;
}

const COLORS =  ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const getSampleData = () => {
    const data = [];
    for (let i = 1; i <= 10; i++) {
        data.push({
            label: "product name" + i,
            value: 100000000000 * Math.random(),

        });
    }
    return data;
};
ProductIncomeChart.defaultProps = {
    data: getSampleData(),
}

function ProductIncomeChart(props: Props) {
    const { data } = props;
    return (
        <PieChart width={1000} height={400}>
            <Pie
                dataKey={ProductIncomeLabel.value}
                data={data}
                outerRadius={80}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}

            </Pie>
            <Tooltip content={<CustomTooltip labelName={labelName} />} />

        </PieChart>
    );
}

export default ProductIncomeChart