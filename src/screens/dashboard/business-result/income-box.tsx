import { Skeleton } from 'antd';
import React from 'react'
import { formatCurrency } from 'utils/AppUtils';

export interface IncomeBoxProps {
    title: string;
    value: number;
    monthlyAccumulated: number;
    type: 'number' | 'percent';
    loading: boolean;
}
IncomeBox.defaultProps = {
    value: 0,
    monthlyAccumulated: 0,
    type: 'number',
    loading: false
}
function IncomeBox(props: IncomeBoxProps) {
    const { title, value, monthlyAccumulated, type, loading } = props;

    return (<div className='income-box'>
        <span className='title'>{title}</span>
        {
            loading ? <>
                <br />
                <Skeleton.Input size={"small"} />
            </> :
                <>
                    <span className='value'>{type === "percent" ? value : formatCurrency(value)}</span>
                    <span className='conclusion'><span>Luỹ kế tháng: </span><b>{formatCurrency(monthlyAccumulated)}</b></span>
                </>
        }
    </div >
    )
}

export default IncomeBox
