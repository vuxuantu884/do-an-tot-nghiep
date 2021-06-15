import {Input} from 'antd';
import { CSSProperties, useCallback } from 'react';
import { FLOATREG, NUMBERREG } from 'utils/RegUtils';

type NumberInputProps = {
  value?: number,
  isFloat?: boolean,
  onChange?: (v: number|null) => void,
  style?: CSSProperties,
  placeholder: string
}

const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
  const {value, isFloat, onChange, placeholder, style} = props;
  const onChangeText = useCallback((e) => {
    if(e.target.value === '') {
      onChange && onChange(null)
      return;
    }
    if(isFloat) {
      if(FLOATREG.test(e.target.value)) {
        onChange && onChange(e.target.value)
        return;
      }
    }
    if(NUMBERREG.test(e.target.value)) {
      onChange && onChange(e.target.value)
      return;
    }
  }, [isFloat, onChange])
  return (
    <Input
      placeholder={placeholder}
      value={value}
      style={style}
      onChange={onChangeText}
    />
  )
}

export default NumberInput;
