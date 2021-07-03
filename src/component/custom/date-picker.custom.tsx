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
}

const CustomDatepicker: React.FC<CustomDatepickerProps> = (props: CustomDatepickerProps) => {
  const {value,  onChange, placeholder, style} = props;
  console.log('value', value);
  return (
    <DatePicker
      style={style}
      value={!isUndefinedOrNull(value) ? moment(value) : undefined}
      placeholder={placeholder}
      onChange={(v, dateSring) => {
        console.log(v);
        console.log(dateSring);
        onChange && onChange(v?.utc().format())
      }}
      format={DATE_FORMAT.DDMMYYY}
    />  
  )
}

export default CustomDatepicker;
