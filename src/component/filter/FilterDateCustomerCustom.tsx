import React, {useMemo} from "react";
import { Button, DatePicker } from "antd";
import {  SettingOutlined } from "@ant-design/icons";
import { StyledSelectDateFilter } from "component/filter/StyledFilterComponent";
import rightArrow from "assets/icon/right-arrow.svg";
import {DATE_FORMAT, formatDateFilter} from "utils/DateUtils";

type SelectDateFilterProps = {
  dateType: string
  clickOptionDate: (type: string, value: string) => void;
  dateSelected: string;
  startDate: any;
  endDate: any;
  handleSelectDateStart: (date: any) => void;
  handleSelectDateEnd: (date: any) => void;
};

const FilterDateCustomerCustom: React.FC<SelectDateFilterProps> = (
  props: SelectDateFilterProps
) => {
  const {
    dateType,
    clickOptionDate,
    dateSelected,
    startDate,
    endDate,
    handleSelectDateStart,
    handleSelectDateEnd
  } = props;

  const startDateValue = useMemo(() => {
    return startDate ? formatDateFilter(startDate) : null;
  }, [startDate]);

  const endDateValue = useMemo(() => {
    return endDate ? formatDateFilter(endDate) : null;
  }, [endDate]);

  return (
    <StyledSelectDateFilter>
      <div className="select-date">
        <div className="date-option">
          <Button
            onClick={() => clickOptionDate(dateType, "yesterday")}
            className={dateSelected === "yesterday" ? "active-btn" : ""}
          >
            Hôm qua
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, "today")}
            className={dateSelected === "today" ? "active-btn" : ""}
          >
            Hôm nay
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, "thisWeek")}
            className={dateSelected === "thisWeek" ? "active-btn" : ""}
          >
            Tuần này
          </Button>
        </div>

        <div className="date-option">
          <Button
            onClick={() => clickOptionDate(dateType, "lastWeek")}
            className={dateSelected === "lastWeek" ? "active-btn" : ""}
          >
            Tuần trước
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, "thisMonth")}
            className={dateSelected === "thisMonth" ? "active-btn" : ""}
          >
            Tháng này
          </Button>

          <Button
            onClick={() => clickOptionDate(dateType, "lastMonth")}
            className={dateSelected === "lastMonth" ? "active-btn" : ""}
          >
            Tháng trước
          </Button>
        </div>

        <div style={{ marginBottom: 5 }}>
          <SettingOutlined style={{ marginRight: "5px" }} />
          Tùy chọn khoảng thời gian:
        </div>

        <div className="date-picker-styled">
          <div className="date-picker-select">
            <DatePicker
              allowClear
              placeholder="Ngày bắt đầu"
              format={DATE_FORMAT.DD_MM_YYYY}
              getPopupContainer={(trigger: any) => trigger.parentElement}
              value={startDateValue}
              onChange={handleSelectDateStart}
            />
          </div>

          <div style={{ padding: "0px 5px" }}>
            <img src={rightArrow} alt="" />
          </div>

          <div className="date-picker-select">
            <DatePicker
              allowClear
              placeholder="Ngày kết thúc"
              format={DATE_FORMAT.DD_MM_YYYY}
              getPopupContainer={(trigger: any) => trigger.parentElement}
              value={endDateValue}
              onChange={handleSelectDateEnd}
            />
          </div>
        </div>

      </div>
    </StyledSelectDateFilter>
  );
};

export default FilterDateCustomerCustom;
