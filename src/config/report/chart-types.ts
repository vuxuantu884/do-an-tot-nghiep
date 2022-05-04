import { ChartTypeValue } from "model/report/analytics.model";

export const chartTypes = [
    {
        label: 'Biểu đồ cột',
        value: ChartTypeValue.VerticalColumn,
    },
    {
        label: 'Biểu đồ tròn',
        value: ChartTypeValue.Pie,
    },
]