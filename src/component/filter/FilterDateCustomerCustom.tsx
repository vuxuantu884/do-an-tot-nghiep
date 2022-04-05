import { Button, DatePicker } from "antd";
import { CloseOutlined, SettingOutlined, SwapRightOutlined } from "@ant-design/icons";
import { StyledSelectDateFilter } from "component/filter/StyledFilterComponent";

type SelectDateFilterProps = {
  dateType: string
  clickOptionDate: (type: string, value: string) => void;
  dateSelected: string;
  startDate: any;
  endDate: any;
  handleRemoveValueDateStart: () => void;
  handleRemoveValueDateEnd: () => void;
  handleGetDateStart: (date: any) => void;
  handleGetDateEnd: (date: any) => void;
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
    handleRemoveValueDateStart,
    handleRemoveValueDateEnd,
    handleGetDateStart,
    handleGetDateEnd
  } = props;


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
        
        <div className="buy-customer-box">
          <div
            className={
              `buy-customer-box-start 
              ${startDate !== null 
                && startDate !== undefined 
                && 'buy-customer-box-suffix'
              }`
            }
          >
            <DatePicker
                allowClear={false}
                className="buy-start-customer"
                placeholder="Ngày bắt đầu"
                format="DD-MM-YYYY"
                value={startDate}
                onChange={(date) => handleGetDateStart(date)}
              />
              <span 
               className="buy-customer-box-start-close"
               onClick={handleRemoveValueDateStart}
              >
              <CloseOutlined />
              </span>
          </div>

          <div style={{ padding: "0px 5px" }}>
            <SwapRightOutlined />
          </div>

            <div className={
              `buy-customer-box-end 
              ${endDate !== null 
                && endDate !== undefined 
                && 'buy-customer-box-suffix'
              }`
            }>
              <DatePicker
                allowClear={false}
                className="buy-end-customer"
                placeholder="Ngày kết thúc"
                format="DD-MM-YYYY"
                value={endDate}
                onChange={(date) => handleGetDateEnd(date)}
              />
              <span 
               className="buy-customer-box-start-close"
               onClick={handleRemoveValueDateEnd}
              >
              <CloseOutlined />
              </span>
            </div>
         </div>
        
      </div>
    </StyledSelectDateFilter>
  );
};

export default FilterDateCustomerCustom;
