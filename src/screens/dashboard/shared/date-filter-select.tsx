import { Select, SelectProps } from 'antd'
import React, { ReactElement } from 'react'

interface Props extends SelectProps<string> { }
const DATE_FILTER_OPTIONS = [{
    value: 'today',
    label: 'Hôm nay',
}, {
    value: 'yesterday',
    label: 'Hôm qua',
},
{
    value: 'this_week',
    label: 'Tuần này',
},
{
    value: 'last_week',
    label: "Tuần trước",
},
]

DateFilterSelect.defaultProps = {
    allowClear: true,
    showArrow: false,
    placeholder: 'Chọn thời gian',
    defaultValue: 'today',
    options: DATE_FILTER_OPTIONS
}

function DateFilterSelect(props: Props): ReactElement {

    return (
        <Select {...props} />
    )
}

export default DateFilterSelect
