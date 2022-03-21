import { SettingOutlined } from "@ant-design/icons";
import { Button, DatePicker } from "antd";
import moment from "moment";
import { StyledSelectDateFilter } from "screens/web-app/common/commonStyle";

type SelectDateFilterProps = {
  clickOptionDate: (type: string, value: string) => void;
  onChangeRangeDate: (dates: any, dateString: any, type: string) => void;
  dateType: string;
  dateSelected: string;
  startDate: any;
  endDate: any;
  isUTC?: boolean | false;
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
    isUTC,
  } = props;

  return (
    <StyledSelectDateFilter>
      <div className="select-connection-date">
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
            onClick={() => clickOptionDate(dateType, "thisweek")}
            className={dateSelected === "thisweek" ? "active-btn" : ""}
          >
            Tuần này
          </Button>
        </div>
        <div className="date-option">
          <Button
            onClick={() => clickOptionDate(dateType, "lastweek")}
            className={dateSelected === "lastweek" ? "active-btn" : ""}
          >
            Tuần trước
          </Button>
          <Button
            onClick={() => clickOptionDate(dateType, "thismonth")}
            className={dateSelected === "thismonth" ? "active-btn" : ""}
          >
            Tháng này
          </Button>
          <Button
            onClick={() => clickOptionDate(dateType, "lastmonth")}
            className={dateSelected === "lastmonth" ? "active-btn" : ""}
          >
            Tháng trước
          </Button>
        </div>

        <span style={{ margin: "10px 0" }}>
          <SettingOutlined style={{ marginRight: "5px" }} />
          Tùy chọn khoảng thời gian:
        </span>
        {!isUTC &&
          <DatePicker.RangePicker
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
            value={[
              startDate ? moment(startDate, "DD-MM-YYYY") : null,
              endDate ? moment(endDate, "DD-MM-YYYY") : null,
            ]}
            onChange={(date, dateString) =>
              onChangeRangeDate(date, dateString, dateType)
            }
          />
        }

        {isUTC &&
          <DatePicker.RangePicker
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
            value={[
              startDate ? moment(new Date(startDate), "DD-MM-YYYY") : null,
              endDate ? moment(new Date(endDate), "DD-MM-YYYY") : null,
            ]}
            onChange={(date, dateString) =>
              onChangeRangeDate(date, dateString, dateType)
            }
          />
        }
        
      </div>
    </StyledSelectDateFilter>
  );
};

export default SelectDateFilter;
