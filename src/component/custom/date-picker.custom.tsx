import { DatePicker } from "antd"
import moment from "moment";
import { CSSProperties } from "react";
import { isUndefinedOrNull } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

type CustomDatepickerProps = {
  value?: string,
  onChange?: (value: string|undefined) => void,
  style?: CSSProperties
  placeholder?: string,
  className?: string
}

const CustomDatepicker: React.FC<CustomDatepickerProps> = (props: CustomDatepickerProps) => {
  const {value,  onChange, placeholder, style} = props;
  return (
    <DatePicker
      style={style}
      value={!isUndefinedOrNull(value) ? moment(value) : undefined}
      placeholder={placeholder}
      onChange={(v, dateSring) => {
        onChange && onChange(v?.utc().format())
      }}
      className={props.className}
      format={DATE_FORMAT.DDMMYYY}
    />  
  )
}

export default CustomDatepicker;
