import { Select, SelectProps } from "antd";
import { AmountTimeMonthFilter } from "model/dashboard/dashboard.model";
import queryString from "query-string";
import React, { ReactElement } from "react";
import { useHistory, useLocation } from "react-router-dom";
interface Props extends SelectProps<string> {}

const DATE_FILTER_OPTIONS = [
  {
    value: AmountTimeMonthFilter.TO_DAY,
    label: "Hôm nay",
  },
  {
    value: AmountTimeMonthFilter.YESTERDAY,
    label: "Hôm qua",
  },
  {
    value: AmountTimeMonthFilter.THIS_WEEK,
    label: "Tuần này",
  },
  {
    value: AmountTimeMonthFilter.LAST_WEEK,
    label: "Tuần trước",
  },
];

DateFilterSelect.defaultProps = { 
  showArrow: false,
  placeholder: "Chọn thời gian",
  defaultValue: AmountTimeMonthFilter.TO_DAY,
  options: DATE_FILTER_OPTIONS,
};

function DateFilterSelect(props: Props): ReactElement {
  const params = queryString.parse(useLocation().search);
  const history = useHistory();
  const handleOnChange = (value: string) => {
    history.replace("?" + queryString.stringify({ ...params, amountTime: value }));
  };
  return (
    <Select
      {...props}
      onChange={handleOnChange}
      defaultValue={typeof params?.amountTime === "string" ? params.amountTime : undefined}
    />
  );
}

export default DateFilterSelect;
