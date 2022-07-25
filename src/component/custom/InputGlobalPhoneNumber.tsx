import React, { useEffect, useState } from "react";
import { CSSProperties, useCallback } from "react";
import {Input, Select} from "antd";
import {showWarning} from "utils/ToastUtils";
import {useDispatch} from "react-redux";
import {GetRegionAction} from "domain/actions/content/content.action";
import {RegionResponse} from "model/content/country.model";
import noImage from "assets/img/no-image.png";
import {RegionListDropdownStyled} from "./StyledCustomComponent";
import "component/custom/InputGlobalPhoneNumber.scss";

const { Option } = Select;

interface InputPhoneNumberProps {
  id?: string
  style?: CSSProperties;
  className?: string;
  placeholder?: string;
  defaultValue?: number | string | null;
  disabled?: boolean;
  onChange?: (v: string | null) => void;
  onBlur?: () => void;
  onPressEnter?: (event:any) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  maxLength?: number;
  minLength?: number;
  allowClear?: boolean;
  regionCode?: string;
  setRegionCode?: (region: string) => void;
}

const NOT_NUMBER_REGEX = /[^0-9]/ig;

const InputGlobalPhoneNumber: React.FC<InputPhoneNumberProps> = ({...props}: InputPhoneNumberProps) => {
  const {
    id,
    className,
    style,
    placeholder,
    defaultValue,
    disabled = false,
    onChange,
    onBlur,
    onPressEnter,
    prefix,
    suffix,
    maxLength,
    minLength,
    allowClear,
    regionCode,
    setRegionCode,
  } = props;

  const dispatch = useDispatch();

  const [data, setData] = useState<string>('');
  const [regionList, setRegionList] = useState<Array<RegionResponse>>([]);

  useEffect(() => {
    dispatch(GetRegionAction((response) => {
      if (response) {
        setRegionList(response)
      }
    }));
  }, [dispatch]);

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

  const handleSelectRegion = (value: any) => {
    setRegionCode && setRegionCode(value);
  }

  const renderRegionList = () => {
    return (
      <RegionListDropdownStyled>
        <Select
          style={{ width: 80 }}
          value={regionCode}
          onSelect={handleSelectRegion}
        >
          {regionList?.map((region: any, index: number) => (
            <Option key={index} value={region.region_code}>
              <div className="region-item">
                <img
                  src={region.flag_image || noImage}
                  alt={"region-flag"}
                  style={{ marginRight: "10px", height: "25px", border: "0.5px solid black" }}
                />
                <span className={"country-name"} style={{ marginRight: "5px" }}>{region.country_name}</span>
                <span className={"region-code"} style={{ color: "#737373" }}>(+{region.region_code})</span>
              </div>
            </Option>
          ))}
        </Select>
      </RegionListDropdownStyled>
    )
  }

  return (
    <Input
      id={id}
      className={className}
      style={style}
      addonBefore={renderRegionList()}
      placeholder={placeholder}
      value={data}
      disabled={disabled}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onPressEnter={onPressEnter}
      prefix={prefix}
      suffix={suffix}
      maxLength={maxLength || 14}
      minLength={minLength || 9}
      allowClear={allowClear}
    />
  );
};

export default InputGlobalPhoneNumber;
