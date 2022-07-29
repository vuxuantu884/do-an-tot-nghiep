import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import React, { PropsWithChildren } from "react";

type ListItemProductProps<T> = {
  onSelect: (item: T, index: number) => void;
  index: number;
  item: T;
  showCheckBox: boolean;
  children: React.ReactNode;
  checked: boolean;
};

ListItem.defaultProps = {
  showCheckBox: true,
};

function ListItem<T>(props: PropsWithChildren<ListItemProductProps<T>>) {
  const { onSelect, item, showCheckBox, children, index, checked } = props;
  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      onSelect(item, index);
    }
  };
  return (
    <div className="product-item product-item-select" onClick={() => onSelect(item, index)}>
      {showCheckBox && <Checkbox onChange={handleCheckboxChange} checked={checked} />}
      {children}
    </div>
  );
}

export default ListItem;
