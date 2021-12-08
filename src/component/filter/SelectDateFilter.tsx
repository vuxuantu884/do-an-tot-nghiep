import { Button, DatePicker } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import moment from "moment";
import { StyledSelectDateFilter } from "component/filter/StyledFilterComponent";

type SelectDateFilterProps = {
  clickOptionDate: (type: string, value: string) => void;
  onChangeRangeDate: (dates: any, dateString: any, type: string) => void;
  dateType: string;
  dateSelected: string;
  startDate: any;
  endDate: any;
};

const SelectDateFilter: React.FC<SelectDateFilterProps> = (
  props: SelectDateFilterProps
) => {
  const {
    clickOptionDate,
    onChangeRangeDate,
    dateType,
    dateSelected,
    startDate,
    endDate,
  } = props;

  const startDateValue = startDate ? moment(startDate).add(7, 'h'): null;
  const endDateValue = endDate ? moment(endDate) : null;

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

        <span style={{ margin: "10px 0" }}>
          <SettingOutlined style={{ marginRight: "5px" }} />
          Tùy chọn khoảng thời gian:
        </span>

        <DatePicker.RangePicker
          format="DD-MM-YYYY"
          style={{ width: "100%" }}
          value={[startDateValue, endDateValue]}
          onChange={(date, dateString) =>
            onChangeRangeDate(date, dateString, dateType)
          }
        />
        
      </div>
    </StyledSelectDateFilter>
  );
};

export default SelectDateFilter;
