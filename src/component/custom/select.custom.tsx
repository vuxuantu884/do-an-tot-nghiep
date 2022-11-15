import React, { CSSProperties, ReactNode } from "react";
import { SelectProps, Select as ANTSelect } from "antd";
import classNames from "classnames";
import { fullTextSearch } from "utils/StringUtils";

interface IProps extends SelectProps<any> {
  style?: CSSProperties;
  containerStyle?: CSSProperties;
  className?: string;
  containerClassName?: string;
  suffix?: ReactNode;
  isDropdownAlwaysAtBottomLeft?: boolean;
}

const { Option, OptGroup } = ANTSelect;

const CustomSelect = (props: IProps) => {
  const {
    suffix,
    style,
    className,
    containerClassName,
    containerStyle,
    isDropdownAlwaysAtBottomLeft = true,
    ...rest
  } = props;

  return (
    <div
      className={classNames("custom-select", className, suffix && "custom-select-has-suffix")}
      style={style}
    >
      <ANTSelect
        className={containerClassName}
        style={containerStyle}
        filterOption={(input, option) => fullTextSearch(input, option?.children)}
        // select dropdown luôn ở dưới bên trái: https://github.com/react-component/select/issues/254
        dropdownAlign={
          isDropdownAlwaysAtBottomLeft
            ? {
                points: ["tl", "tr"], // align top left point of sourceNode with top right point of targetNode
                offset: [0, 0], // the offset sourceNode by 10px in x and 20px in y,
                targetOffset: ["100%", "-100%"], // the offset targetNode by 30% of targetNode width in x and 40% of targetNode height in y,
                overflow: { adjustX: true, adjustY: false }, // auto adjust position when sourceNode is overflowed
              }
            : undefined
        }
        {...rest}
      />
      {suffix && <div className="custom-select-suffix">{suffix}</div>}
    </div>
  );
};

CustomSelect.Option = Option;
CustomSelect.OptGroup = OptGroup;

export default CustomSelect;
