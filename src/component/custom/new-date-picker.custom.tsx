import { DatePicker } from "antd";
import moment, { Moment } from "moment";
import { CSSProperties } from "react";
import { isUndefinedOrNull } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

type CustomDatePickerProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  style?: CSSProperties;
  placeholder?: string;
  className?: string;
  disableDate?: (date: Moment) => boolean;
  format?: string;
  showTime?: boolean;
  defaultValue?: Moment | undefined
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = (
  props: CustomDatePickerProps
) => {
  const { value, onChange, format, placeholder, style } = props;
  return (
    <DatePicker
      defaultValue={props.defaultValue}
      style={style}
      value={!isUndefinedOrNull(value) ? moment(value, format) : undefined}
      placeholder={placeholder}
      onChange={(v, dateString) => {
        onChange && onChange(v?.format(format));
      }}
      disabledDate={props.disableDate}
      className={props.className}
      format={props.format || DATE_FORMAT.DDMMYYY}
      showTime={props.showTime}
    />
  );
};

export default CustomDatePicker;