import { BUSINESS_RESULT_CART_LABEL } from 'config/dashboard'
import React from 'react'
import { DashboardContext } from '../provider/dashboard-provider'
import IncomeBox, { IncomeBoxProps } from './income-box'

type Props = Partial<IncomeBoxProps> & {
    dataKey: string;
}

function BusinessCard({ dataKey,...rest }: Props) {
    const { dataSrcBusinessResultCard } = React.useContext(DashboardContext)
    return (

        <IncomeBox
            title={BUSINESS_RESULT_CART_LABEL[dataKey]}
            value={dataSrcBusinessResultCard.get(dataKey)?.value}
            monthlyAccumulated={dataSrcBusinessResultCard.get(dataKey)?.monthlyAccumulated}
            {...rest}
        />

    )
}

export default BusinessCard