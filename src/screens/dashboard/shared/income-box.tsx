import React from 'react'
import { formatCurrency } from 'utils/AppUtils';

interface Props {
    title: string;
    value: number;
    monthlyAccumulated: number;
    type: 'number' | 'percent';
}
 
function IncomeBox(props: Props) {
    const { title, value, monthlyAccumulated , type } = props; 
    return (
        <div className='income-box'>
            <span className='title'>{title}</span>
            <span className='value'>{type === "percent" ? value : formatCurrency(value)}</span>
            <span className='conclusion'><span>Luỹ kế tháng: </span><b>{formatCurrency(monthlyAccumulated)}</b></span>
        </div>
    )
}

export default IncomeBox
