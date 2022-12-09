import React, { useState } from "react";
import BaseSelect from "./BaseSelect";
import { BaseSelectPagingType } from "./BaseSelect.type";
import debounce from "lodash/debounce";
import { AppConfig } from "../../../config/app.config";
import BaseSelectPagination from "./BaseSelectPagination";

function BaseSelectPaging<T>({
  metadata,
  fetchData,
  valueSearch,
  onDeselect,
  onSearch,
  ...props
}: BaseSelectPagingType<T>) {
  const totalPage = metadata ? Math.ceil((metadata.total || 1) / (metadata.limit || 1)) : 1;

  const onSearchValue = (value: string) => {
    onSearch && onSearch(value);
    fetchData && fetchData({ condition: value.trim(), page: 1 });
  };
  const onChange = (type: "next" | "prev") => {
    let newPage = type === "next" ? metadata.page + 1 : metadata.page - 1;
    if ((type === "prev" && newPage >= 1) || (type === "next" && newPage <= totalPage)) {
      console.log("value", valueSearch);
      fetchData({
        [`${valueSearch ? "info" : "condition"}`]: valueSearch?.trim(),
        page: newPage,
      });
    }
  };
  return (
    <BaseSelect<T>
      optionFilterProp="children"
      showSearch
      valueSearch={valueSearch}
      onSearch={debounce(onSearchValue, AppConfig.TYPING_TIME_REQUEST)}
      filterOption={false}
      {...props}
      onDeselect={onDeselect}
      dropdownRender={(menu) => (
        <BaseSelectPagination
          page={metadata?.page}
          totalPage={totalPage}
          onChange={onChange}
          menu={menu}
        />
      )}
    />
  );
}

export default BaseSelectPaging;
