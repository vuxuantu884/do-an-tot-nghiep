import { Input } from "antd";
import React, { useEffect, useState } from "react";
import { CSSProperties, useCallback } from "react";
import { RegUtil } from "utils/RegUtils";

interface NumberInputProps {
  id?: string
  value?: number;
  isFloat?: boolean;
  onChange?: (v: number | null) => void;
  onBlur?: () => void;
  style?: CSSProperties;
  placeholder?: string;
  format?: (a: string) => string;
  replace?: (a: string) => string;
  suffix?: React.ReactNode;
  maxLength?: number;
  minLength?: number;
  className?: string;
  min?: number;
  max?: number;
  default?: number;
  prefix?: React.ReactNode;
  autoFocus?: boolean;
  onFocus?: () => void
}

const NumberInput: React.FC<NumberInputProps> = (props: NumberInputProps) => {
  const {
    replace,
    value,
    isFloat,
    onChange,
    placeholder,
    style,
    format,
    onBlur,
    suffix,
    maxLength,
    minLength,
    className,
    prefix,
    id,
    onFocus
  } = props;
  const [data, setData] = useState<string>('');
  const onChangeText = useCallback(
    (e) => {
      let newValue: string = e.target.value;
      let valueS = format ? (replace ? replace(newValue) : newValue) : newValue;
      if (valueS === "") {
        setData(valueS);
        onChange && onChange(null);
        return;
      }
      if (isFloat) {
        if (RegUtil.FLOATREG.test(valueS)) {
          console.log('vào đây FLOATREG');
          setData(valueS);
          if(valueS[valueS.length - 1] !== '.') {
            onChange && onChange(parseFloat(valueS));
          }
          return;
        }
      }
      if (RegUtil.NUMBERREG.test(valueS)) {
        setData(valueS);
        onChange && onChange(parseInt(valueS));
        return;
      }
    },
    [format, isFloat, onChange, replace]
  );
  const onBlurEvent = useCallback(
    (e) => {
      let temp = value?.toString();
      let valueTemp = temp;
      if (temp !== undefined && value !== undefined) {
        if (temp.charAt(temp.length - 1) === "." || temp === "-") {
          valueTemp = temp.slice(0, -1);
        }
        if (props.min !== undefined && value < props.min) {
          onChange && onChange(props.min);
        } else if (props.max !== undefined && value > props.max) {
          onChange && onChange(props.max);
        } else {
          onChange &&
            valueTemp &&
            onChange(parseFloat(valueTemp.replace(/0*(\d+)/, "$1")));
        }
      } else {
        if (props.default !== undefined) {
          onChange && onChange(props.default);
        }
      }
      onBlur && onBlur();
    },
    [onBlur, onChange, props, value]
  );
  useEffect(() => {
    setData(value !== undefined && value !== null ? value.toString() : '');
  }, [value]);
  return (
    <Input
      id={id}
      className={className}
      placeholder={placeholder}
      value={format ? format(data) : data}
      style={{textAlign: 'right', ...style}}
      onBlur={onBlurEvent}
      onChange={onChangeText}
      suffix={suffix}
      maxLength={maxLength}
      minLength={minLength}
      onFocus={(e) => {
        e.target.select();
        onFocus && onFocus();
      }}
      prefix={prefix}
      autoFocus={props.autoFocus}
    />
  );
};

export default NumberInput;
