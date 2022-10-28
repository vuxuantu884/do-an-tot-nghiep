import React, { useMemo } from "react";
import { Button, DatePicker, Form } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import { SettingOutlined } from "@ant-design/icons";
import { StyledSelectDateFilter } from "component/filter/StyledFilterComponent";
import rightArrow from "assets/icon/right-arrow.svg";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import moment from "moment";
import { DATE_OPTION_VALUE } from "utils/Constants";

const DATE_SELECTED_OPTION = {
  todayFrom: moment().startOf("day").format(DATE_FORMAT.DD_MM_YYYY),
  todayTo: moment().endOf("day").format(DATE_FORMAT.DD_MM_YYYY),

  yesterdayFrom: moment().startOf("day").subtract(1, "days").format(DATE_FORMAT.DD_MM_YYYY),
  yesterdayTo: moment().endOf("day").subtract(1, "days").format(DATE_FORMAT.DD_MM_YYYY),

  thisWeekFrom: moment().startOf("week").format(DATE_FORMAT.DD_MM_YYYY),
  thisWeekTo: moment().endOf("week").format(DATE_FORMAT.DD_MM_YYYY),

  lastWeekFrom: moment().startOf("week").subtract(1, "weeks").format(DATE_FORMAT.DD_MM_YYYY),
  lastWeekTo: moment().endOf("week").subtract(1, "weeks").format(DATE_FORMAT.DD_MM_YYYY),

  thisMonthFrom: moment().startOf("month").format(DATE_FORMAT.DD_MM_YYYY),
  thisMonthTo: moment().endOf("month").format(DATE_FORMAT.DD_MM_YYYY),

  lastMonthFrom: moment().subtract(1, "months").startOf("month").format(DATE_FORMAT.DD_MM_YYYY),
  lastMonthTo: moment().subtract(1, "months").endOf("month").format(DATE_FORMAT.DD_MM_YYYY),
};

export const handleSelectedDate = (date_from: any, date_to: any, setDateSelected: any) => {
  const dateFrom = formatDateFilter(date_from)?.format(DATE_FORMAT.DD_MM_YYYY);
  const dateTo = formatDateFilter(date_to)?.format(DATE_FORMAT.DD_MM_YYYY);
  if (
    dateFrom === DATE_SELECTED_OPTION.todayFrom &&
    dateTo === DATE_SELECTED_OPTION.todayTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.today);
  } else if (
    dateFrom === DATE_SELECTED_OPTION.yesterdayFrom &&
    dateTo === DATE_SELECTED_OPTION.yesterdayTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.yesterday);
  } else if (
    dateFrom === DATE_SELECTED_OPTION.thisWeekFrom &&
    dateTo === DATE_SELECTED_OPTION.thisWeekTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.thisWeek);
  } else if (
    dateFrom === DATE_SELECTED_OPTION.lastWeekFrom &&
    dateTo === DATE_SELECTED_OPTION.lastWeekTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.lastWeek);
  } else if (
    dateFrom === DATE_SELECTED_OPTION.thisMonthFrom &&
    dateTo === DATE_SELECTED_OPTION.thisMonthTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.thisMonth);
  } else if (
    dateFrom === DATE_SELECTED_OPTION.lastMonthFrom &&
    dateTo === DATE_SELECTED_OPTION.lastMonthTo
  ) {
    setDateSelected(DATE_OPTION_VALUE.lastMonth);
  } else {
    setDateSelected("");
  }
};

export const convertSelectedDateOption = (selectedDateOption: string) => {
  let startDateValue = null;
  let endDateValue = null;
  switch (selectedDateOption) {
    case DATE_OPTION_VALUE.today:
      startDateValue = moment().utc().startOf("day");
      endDateValue = moment().utc().endOf("day");
      break;
    case DATE_OPTION_VALUE.yesterday:
      startDateValue = moment().utc().startOf("day").subtract(1, "days");
      endDateValue = moment().utc().endOf("day").subtract(1, "days");
      break;
    case DATE_OPTION_VALUE.thisWeek:
      startDateValue = moment().utc().startOf("week");
      endDateValue = moment().utc().endOf("week");
      break;
    case DATE_OPTION_VALUE.lastWeek:
      startDateValue = moment().utc().startOf("week").subtract(1, "weeks");
      endDateValue = moment().utc().endOf("week").subtract(1, "weeks");
      break;
    case DATE_OPTION_VALUE.thisMonth:
      startDateValue = moment().utc().startOf("month");
      endDateValue = moment().utc().endOf("month");
      break;
    case DATE_OPTION_VALUE.lastMonth:
      startDateValue = moment().utc().subtract(1, "months").startOf("month");
      endDateValue = moment().utc().subtract(1, "months").endOf("month");
      break;
    default:
      break;
  }
  return {startDateValue, endDateValue}
};


type SelectDateFilterProps = {
  fieldNameFrom?: string;
  fieldNameTo?: string;
  dateType: string;
  clickOptionDate: (type: string, value: string) => void;
  dateSelected: string;
  startDate: any;
  endDate: any;
  handleSelectDateStart: (date: any) => void;
  handleSelectDateEnd: (date: any) => void;
};

const SelectRangeDateCustom: React.FC<SelectDateFilterProps> = (
  props: SelectDateFilterProps,
) => {
  const {
    fieldNameFrom,
    fieldNameTo,
    dateType,
    clickOptionDate,
    dateSelected,
    startDate,
    endDate,
    handleSelectDateStart,
    handleSelectDateEnd,
  } = props;

  const startDateValue = useMemo(() => {
    return startDate ? formatDateFilter(startDate) : null;
  }, [startDate]);

  const endDateValue = useMemo(() => {
    return endDate ? formatDateFilter(endDate) : null;
  }, [endDate]);

  const onChangeSelectDateStart = (date: any, dateString: any) => {
    handleSelectDateStart(dateString);
  };

  const onChangeSelectDateEnd = (date: any, dateString: any) => {
    handleSelectDateEnd(dateString);
  };

  const disabledDateStart: RangePickerProps['disabledDate'] = current => {
    if (current && endDateValue) {
      return current > endDateValue;
    } else {
      return false;
    }
  };

  const disabledDateEnd: RangePickerProps['disabledDate'] = current => {
    if (current && startDateValue) {
      return current < startDateValue;
    } else {
      return false;
    }
  };

  return (
    <StyledSelectDateFilter>
      <div className="select-date">
        <div className="date-option">
          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.yesterday)}
            className={dateSelected === DATE_OPTION_VALUE.yesterday ? "active-btn" : ""}
          >
            Hôm qua
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.today)}
            className={dateSelected === DATE_OPTION_VALUE.today ? "active-btn" : ""}
          >
            Hôm nay
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.thisWeek)}
            className={dateSelected === DATE_OPTION_VALUE.thisWeek ? "active-btn" : ""}
          >
            Tuần này
          </Button>
        </div>

        <div className="date-option">
          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.lastWeek)}
            className={dateSelected === DATE_OPTION_VALUE.lastWeek ? "active-btn" : ""}
          >
            Tuần trước
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.thisMonth)}
            className={dateSelected === DATE_OPTION_VALUE.thisMonth ? "active-btn" : ""}
          >
            Tháng này
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, DATE_OPTION_VALUE.lastMonth)}
            className={dateSelected === DATE_OPTION_VALUE.lastMonth ? "active-btn" : ""}
          >
            Tháng trước
          </Button>
        </div>

        <div style={{ marginBottom: 5 }}>
          <SettingOutlined style={{ marginRight: "5px" }} />
          Tùy chọn khoảng thời gian:
        </div>

        <div className="date-picker-styled">
          <Form.Item name={fieldNameFrom}>
            <div className="date-picker-select">
              <DatePicker
                allowClear
                placeholder="Ngày bắt đầu"
                format={DATE_FORMAT.DD_MM_YYYY}
                getPopupContainer={(trigger: any) => trigger.parentElement}
                value={startDateValue}
                onChange={onChangeSelectDateStart}
                disabledDate={disabledDateStart}
              />
            </div>
          </Form.Item>

          <div style={{ padding: "0px 5px" }}>
            <img src={rightArrow} alt="" />
          </div>

          <Form.Item name={fieldNameTo}>
            <div className="date-picker-select">
              <DatePicker
                allowClear
                placeholder="Ngày kết thúc"
                format={DATE_FORMAT.DD_MM_YYYY}
                getPopupContainer={(trigger: any) => trigger.parentElement}
                value={endDateValue}
                onChange={onChangeSelectDateEnd}
                disabledDate={disabledDateEnd}
              />
            </div>
          </Form.Item>
        </div>
      </div>
    </StyledSelectDateFilter>
  );
};

export default SelectRangeDateCustom;
