import { Button, DatePicker } from 'antd';
import moment from 'moment';
import React from 'react';
import { DATE_FORMAT } from 'utils/DateUtils';
import { compare2RangeDate } from 'utils/ReportUtils';
import { AnalyticsDatePickerStyle } from '../index.style';
const { RangePicker } = DatePicker;

interface Props {
    [name: string]: any;
}

function AnalyticsDatePicker(props: Props) {
    const { onChange, value } = props;
    const FIXED_DATE_LIST = [
        {
            label: 'Hôm nay',
            value: [moment().startOf("day"), moment()],
        },
        {
            label: 'Hôm qua',
            value: [moment().subtract(1, 'days').startOf("day"), moment().subtract(1, 'days')],
        },
        {
            label: 'Tuần này',
            value: [moment().startOf("week"), moment()],
        },
        {
            label: 'Tháng này',
            value: [moment().startOf("month"), moment()],
        },
        {
            label: '1 tháng trước',
            value: [moment().subtract(1, 'months').startOf("day"), moment()],
        },
        {
            label: '6 tháng trước',
            value: [moment().subtract(6, 'months').startOf("day"), moment()],
        },
        {
            label: 'Năm nay',
            value: [moment().startOf("year"), moment()],
        },
        {
            label: 'Năm trước',
            value: [moment().startOf("year").subtract(1, "year"), moment().endOf("year").subtract(1, "year")],
        }
    ];

    const [open, setOnOpen] = React.useState(false);
    return (
        <RangePicker className='input-width'
            allowClear={false}
            format={DATE_FORMAT.DDMMYYY}
            open={open}
            onOpenChange={(open) => setOnOpen(open)}
            panelRender={(originPanel: React.ReactNode) => {
                return (
                    <AnalyticsDatePickerStyle>
                        <div className='picker-panel'>
                            {
                                FIXED_DATE_LIST.map((item, index) => {
                                    return (
                                        <Button className={`picker-panel__item  ${compare2RangeDate(item.value, value) ? 'ant-btn-primary' : ""}`} key={index}
                                            onClick={() => {
                                                onChange(item.value);
                                                setOnOpen(false)
                                                console.log(value)
                                            }}>
                                            {item.label}
                                        </Button>
                                    )
                                })
                            }
                        </div>
                        {originPanel}
                    </AnalyticsDatePickerStyle>
                )
            }}
            {...props}
        />
    )
}



export default AnalyticsDatePicker