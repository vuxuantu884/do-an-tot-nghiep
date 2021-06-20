import { DatePicker } from "antd"
import moment from "moment";

type CustomDatepickerProps = {
  value?: string,
  onChange?: (value: string) => void,
  format?: string,
  placeholder?: string,
}

const CustomDatepicker: React.FC<CustomDatepickerProps> = (props: CustomDatepickerProps) => {
  const {value, format, onChange, placeholder} = props;
  return (
    <DatePicker
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
