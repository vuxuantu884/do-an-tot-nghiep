import React from 'react'
import { formatCurrency } from 'utils/AppUtils';

interface Props {
    title: string;
    value: number;
    conclusion: number;
    type: 'number' | 'percent';
}
IncomeBox.defaultProps = {
    title: 'Doanh thu Online',
    value: 100000000,
    conclusion: 1378400000000,
    type: 'number',
}
function IncomeBox(props: Props) {
    const { title, value, conclusion, type } = props;
    return (
        <div className='income-box'>
            <span className='title'>{title}</span>
            <span className='value'>{type === "percent" ? value : formatCurrency(value)}</span>
            <span className='conclusion'><span>Luỹ kế tháng: </span><b>{formatCurrency(conclusion)}</b></span>
        </div>
    )
}

export default IncomeBox
