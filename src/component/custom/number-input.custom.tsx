import {Input} from 'antd';
import { CSSProperties, useCallback } from 'react';
import { FLOATREG, NUMBERREG } from 'utils/RegUtils';

type NumberInputProps = {
  value?: string,
  isFloat?: boolean,
  onChange?: (v: string|null) => void,
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
      if(FLOATREG.test(value)) {
        onChange && onChange(value)
        return;
      }
    }
    if(NUMBERREG.test(value)) {
      onChange && onChange(value)
      return;
    }
  }, [format, isFloat, onChange, replace])
  const onBlurEvent = useCallback((e) => {
    let valueTemp = value;
    if(value) {
      if (value.charAt(value.length - 1) === '.' || value === '-') {
        valueTemp = value.slice(0, -1);
      }
      (onChange && valueTemp) && onChange(valueTemp.replace(/0*(\d+)/, '$1'));
    }
    onBlur && onBlur();
  }, [onBlur, onChange, value])
  return (
    <Input
      placeholder={placeholder}
      value={value && format ? format(value) : value}
      style={style}
      onBlur={onBlurEvent}
      onChange={onChangeText}
      suffix={suffix}
    />
  )
}

export default NumberInput;
