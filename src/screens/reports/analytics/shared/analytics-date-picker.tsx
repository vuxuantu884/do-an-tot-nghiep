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
            selected: false
        },
        {
            label: 'Hôm qua',
            value: [moment().subtract(1, 'days').startOf("day"), moment().subtract(1, 'days')],
            selected: false
        },
        {
            label: 'Tuần này',
            value: [moment().startOf("isoWeek"), moment()],
            selected: false
        },
        {
            label: 'Tuần trước',
            value: [moment().subtract(1, 'week').startOf("isoWeek"), moment().subtract(1, 'week').endOf("isoWeek")],
            selected: false
        },
        {
            label: 'Tháng này',
            value: [moment().startOf("month"), moment()],
            selected: false
        },
        {
            label: 'Tháng trước',
            value: [moment().subtract(1, 'months').startOf("month"), moment().subtract(1, 'months').endOf("month")],
            selected: false
        },
        // {
        //     label: '6 tháng trước',
        //     value: [moment().subtract(6, 'months').startOf("day"), moment()],
        //     selected: false
        // },
        {
            label: 'Năm nay',
            value: [moment().startOf("year"), moment()],
            selected: false
        },
        {
            label: 'Năm trước',
            value: [moment().startOf("year").subtract(1, "year"), moment().endOf("year").subtract(1, "year")],
            selected: false
        }
    ];

    const [open, setOnOpen] = React.useState(false);
    const [stateTimeList, setStateTimeList] = React.useState<any[]>([]);
    return (
        <RangePicker className='input-width'
            allowClear={false}
            format={DATE_FORMAT.DDMMYYY}
            open={open}
            onOpenChange={(open) => {
                if (!stateTimeList.length) {
                    const selectedIdx = FIXED_DATE_LIST.findIndex(timeItem => compare2RangeDate(timeItem.value, value));
                    if (selectedIdx !== -1) {
                        FIXED_DATE_LIST[selectedIdx].selected = true;
                    }
                    setStateTimeList([...FIXED_DATE_LIST]);
                }
                setOnOpen(open)
            }}
            panelRender={(originPanel: React.ReactNode) => {
                return (
                    open && <AnalyticsDatePickerStyle>
                        <div className='picker-panel'>
                            {
                                stateTimeList.map((item, index) => {
                                    return (
                                        <Button className={`picker-panel__item  ${item.selected ? 'ant-btn-primary' : ""}`} key={index}
                                            onClick={() => {
                                                onChange(item.value);
                                                setOnOpen(false)
                                                item.selected = true
                                                setStateTimeList((prevState) => [...prevState.map((dateItem) => {
                                                    if (dateItem.label === item.label) {
                                                        dateItem.selected = true;
                                                    } else {
                                                        dateItem.selected = false;
                                                    }
                                                    return dateItem;
                                                })]);
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