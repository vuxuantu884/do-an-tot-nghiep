import React from "react";
import BaseSelect from "./BaseSelect";
import { BaseSelectPagingType } from "./BaseSelect.type";
import debounce from "lodash/debounce";
import { AppConfig } from "../../../config/app.config";
import BaseSelectPagination from "./BaseSelectPagination";

function BaseSelectPaging<T>({
  metadata,
  fetchData,
  valueSearch,
  ...props
}: BaseSelectPagingType<T>) {
  const totalPage = metadata ? Math.ceil((metadata.total || 1) / (metadata.limit || 1)) : 1;

  const onSearchValue = (value: string) => {
    fetchData && fetchData({ condition: value.trim(), page: 1 });
  };
  const onChange = (type: "next" | "prev") => {
    let newPage = type === "next" ? metadata.page + 1 : metadata.page - 1;
    if ((type === "prev" && newPage >= 1) || (type === "next" && newPage <= totalPage)) {
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
      onSearch={debounce(onSearchValue, AppConfig.TYPING_TIME_REQUEST)}
      filterOption={false}
      {...props}
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
