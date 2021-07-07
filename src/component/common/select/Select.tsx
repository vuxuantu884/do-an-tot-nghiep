import React, { CSSProperties, ReactNode } from "react";
import { SelectProps, Select as ANTSelect } from "antd";
import classNames from "classnames";

interface IProps extends SelectProps<any> {
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  containerClassName?: string;
  suffix?: ReactNode;
}

const { Option, OptGroup } = ANTSelect;

const Select = (props: IProps) => {
  const {
    showSearch,
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
        showSearch
        className={containerClassName}
        style={containerStyle}
        {...rest}
      />
      {suffix && <div className="custom-select-suffix">{suffix}</div>}
    </div>
  );
};

Select.Option = Option;
Select.OptGroup = OptGroup;

export { Select };
