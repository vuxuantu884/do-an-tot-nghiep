import React, { useEffect, useState, useCallback, CSSProperties } from "react";
import { Input } from "antd";
import { RegUtil } from "utils/RegUtils";

interface CustomNumberInputProps {
  id?: string
  value?: any;
  onChange?: (v: any) => void;
  onBlur?: () => void;
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
  format?: (a: string) => string;
  revertFormat?: (a: string) => string;
  prefix?: any;
  suffix?: any;
  maxLength?: number;
  disabled?: boolean;
  autoComplete?: string;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = (props: CustomNumberInputProps) => {
  const {
    id,
    value,
    onChange,
    onBlur,
    style,
    className,
    placeholder,
    format,
    revertFormat,
    prefix,
    suffix,
    maxLength,
    disabled = false,
    autoComplete = "off",
  } = props;

  const [data, setData] = useState<string>('');


  useEffect(() => {
    setData(value !== undefined && value !== null ? value.toString() : '');
  }, [value]);
  
  const handleOnChange = useCallback((e) => {
      let inputText: string = e.target.value;
      const inputValue = format ? (revertFormat ? revertFormat(inputText) : inputText.replace(/\D/g,'')) : inputText;
      setData(inputValue);
      onChange && onChange(inputValue || null);
    },
    [format, onChange, revertFormat]
  );

  const handleOnBlur = useCallback((e) => {
    if (RegUtil.NUMBERREG.test(value)) {
      setData(parseInt(value).toString());
      onChange && onChange(parseInt(value));
    }
    onBlur && onBlur();
  }, [onBlur, onChange, value]);


  return (
    <Input
      id={id}
      className={className}
      placeholder={placeholder}
      value={format ? format(data) : data}
      style={{textAlign: 'right', ...style}}
      onBlur={handleOnBlur}
      onChange={handleOnChange}
      prefix={prefix}
      suffix={suffix}
      maxLength={maxLength}
      disabled={disabled}
      autoComplete={autoComplete}
    />
  );
};

export default CustomNumberInput;
