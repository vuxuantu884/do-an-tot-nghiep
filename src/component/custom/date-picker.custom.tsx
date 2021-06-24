import { DatePicker } from "antd"
import moment from "moment";
import { CSSProperties } from "react";

type CustomDatepickerProps = {
  value?: string,
  onChange?: (value: string) => void,
  format?: string,
  style?: CSSProperties
  placeholder?: string,
}

const CustomDatepicker: React.FC<CustomDatepickerProps> = (props: CustomDatepickerProps) => {
  const {value, format, onChange, placeholder, style} = props;
  return (
    <DatePicker
      style={style}
      value={value ? moment(value) : undefined}
      placeholder={placeholder}
      onChange={(v, dateSring) => {
          onChange && onChange(dateSring)
      }}
      format={format}
    />  
  )
}

export default CustomDatepicker;
