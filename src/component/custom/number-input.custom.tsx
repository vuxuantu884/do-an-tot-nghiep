import {Input} from 'antd';
import { CSSProperties, useCallback } from 'react';
import { RegUtil } from 'utils/RegUtils';

type NumberInputProps = {
  value?: number,
  isFloat?: boolean,
  onChange?: (v: number|null) => void,
  onBlur?: () => void,
  style?: CSSProperties,
  placeholder?: string,
  format?: (a: string) => string,
  replace?: (a: string) => string,
  suffix?: React.ReactNode
}

const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
  const {replace, value, isFloat, onChange, placeholder, style, format, onBlur, suffix} = props;
  const onChangeText = useCallback((e) => {
    let newValue: string = e.target.value;
    let value = format ? (replace ? replace(newValue) : newValue) : newValue;
    if(value === '') {
      onChange && onChange(null)
      return;
    }
    if(isFloat) {
      if(RegUtil.FLOATREG.test(value)) {
        onChange && onChange(parseFloat(value))
        return;
      }
    }
    if(RegUtil.NUMBERREG.test(value)) {
      onChange && onChange(parseInt(value))
      return;
    }
  }, [format, isFloat, onChange, replace])
  const onBlurEvent = useCallback((e) => {
    let temp = value?.toString();
    let valueTemp = temp;
    if(temp) {
      if (temp.charAt(temp.length - 1) === '.' || temp === '-') {
        valueTemp = temp.slice(0, -1);
      }
      (onChange && valueTemp) && onChange(parseFloat(valueTemp.replace(/0*(\d+)/, '$1')));
    }
    onBlur && onBlur();
  }, [onBlur, onChange, value])
  return (
    <Input
      placeholder={placeholder}
      value={value && format ? format(value.toString()) : value}
      style={style}
      onBlur={onBlurEvent}
      onChange={onChangeText}
      suffix={suffix}
    />
  )
}

export default NumberInput;
