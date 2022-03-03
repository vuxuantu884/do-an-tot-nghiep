import React, { CSSProperties, ReactNode } from "react";
import { SelectProps, Select as ANTSelect } from "antd";
import classNames from "classnames";
import { strForSearch } from "utils/RemoveDiacriticsString";

interface IProps extends SelectProps<any> {
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  containerClassName?: string;
  suffix?: ReactNode;
}

const { Option, OptGroup } = ANTSelect;

const CustomSelect = (props: IProps) => {
  const {
    suffix,
    style,
    className,
    containerClassName,
    containerStyle,
    ...rest
  } = props;

  return (
    <div
      className={classNames(
        "custom-select",
        className,
        suffix && "custom-select-has-suffix"
      )}
      style={style}
    >
      <ANTSelect
        className={containerClassName}
        style={containerStyle}
        filterOption={(input: String, option: any) => {
          if (option.props.value) {
            return strForSearch(option.props.children).includes(strForSearch(input));
          }

          return false;
        }}
        {...rest}
      />
      {suffix && <div className="custom-select-suffix">{suffix}</div>}
    </div>
  );
};

CustomSelect.Option = Option;
CustomSelect.OptGroup = OptGroup;

export default CustomSelect;
