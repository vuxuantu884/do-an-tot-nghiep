import React from "react";
import { Select } from "antd";
import { BaseSelectType } from "./BaseSelect.type";
import { strForSearch } from "../../../utils/StringUtils";

function BaseSelect<T>({
  children,
  data = [],
  renderItem = () => {},
  ...props
}: BaseSelectType<T>) {
  return (
    <Select
      filterOption={(input: String, option: any) => {
        if (!option.props.value) return false;
        return strForSearch(option.props.children.toString()).includes(strForSearch(input));
      }}
      allowClear
      maxTagCount="responsive"
      notFoundContent="Không có dữ liệu"
      {...props}>
      {data.map(renderItem)}
    </Select>
  );
}

export default BaseSelect;
