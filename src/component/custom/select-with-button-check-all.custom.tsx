import { Checkbox, SelectProps } from "antd";
import React, { useEffect, useState } from "react";
import CustomSelect from "./select.custom";
import {StyledComponent} from "./select-with-button-check-all.custom.styles"

interface PropTypes extends SelectProps<any> {
  onChangeAllSelect: any;
  getCurrentValue: () => any[] | undefined;
  allValues?: any[];
  [res: string]: any;
}

function CustomSelectWithButtonCheckAll(props: PropTypes) {
  const { onChangeAllSelect, onBlur, getCurrentValue, allValues, ...rest } = props;

  let currentValue = getCurrentValue();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!allValues) {
      return;
    }
    if (!currentValue) {
      setChecked(false);
      return;
    }
    if (currentValue.length === allValues.length) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [currentValue, allValues, onChangeAllSelect]);

  return (
    <React.Fragment>
			<StyledComponent>
				<Checkbox onChange={onChangeAllSelect} checked={checked} />
				<CustomSelect {...rest} dropdownClassName="selectOutsideWidthButtonCheckAll" dropdownStyle={{marginLeft: -20}} dropdownMatchSelectWidth = {false}>{props.children}</CustomSelect>
			</StyledComponent>
    </React.Fragment>
  );
}

export default CustomSelectWithButtonCheckAll;
