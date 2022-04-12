import React, { useEffect, useState } from "react";
import { CSSProperties, useCallback } from "react";
import { Input } from "antd";
import {showWarning} from "utils/ToastUtils";

interface InputPhoneNumberProps {
  id?: string
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
  defaultValue?: number | string | null;
  disabled?: boolean;
  onChange?: (v: string | null) => void;
  onBlur?: () => void;
  onKeyPress?: (event: any) => void;
  onPressEnter?: (event:any) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  maxLength?: number;
  minLength?: number;
  allowClear?: boolean;
}

const NOT_NUMBER_REGEX = /[^0-9]/ig;

const InputPhoneNumber: React.FC<InputPhoneNumberProps> = ({...props}: InputPhoneNumberProps) => {
  const {
    id,
    className,
    style,
    placeholder,
    defaultValue,
    disabled = false,
    onChange,
    onBlur,
    onKeyPress,
    onPressEnter,
    prefix,
    suffix,
    maxLength,
    minLength,
    allowClear,
  } = props;

  const [data, setData] = useState<string>('');

  useEffect(() => {
    if (defaultValue) {
      setData(defaultValue.toString());
    }
  }, [defaultValue]);

  const handleOnChange = useCallback(
    (e) => {
      const inputValue: string = e.target.value;
      if (NOT_NUMBER_REGEX.test(inputValue)) {
        showWarning("Số điện thoại chỉ được phép nhập số!");
      }
      const validInputValue: string = inputValue.replaceAll(NOT_NUMBER_REGEX, '');
      setData(validInputValue);

      onChange && onChange(validInputValue);
    },
    [onChange]
  );

  const handleOnBlur = useCallback(
    (e) => {
      const inputValue: string = e.target.value;
      if (NOT_NUMBER_REGEX.test(inputValue)) {
        showWarning("Số điện thoại chỉ được phép nhập số!");
      }
      const validInputValue: string = inputValue.replaceAll(NOT_NUMBER_REGEX, '');
      setData(validInputValue);

      onBlur && onBlur();
    },
    [onBlur]
  );

  return (
    <Input
      id={id}
      className={className}
      style={style}
      placeholder={placeholder}
      value={data}
      disabled={disabled}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onKeyPress={onKeyPress}
      onPressEnter={onPressEnter}
      prefix={prefix}
      suffix={suffix}
      maxLength={maxLength || 14}
      minLength={minLength || 9}
      allowClear={allowClear}
    />
  );
};

export default InputPhoneNumber;
