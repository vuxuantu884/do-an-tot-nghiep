import { SelectProps, Select } from "antd";
import { AccountPublicSearchQuery } from "model/account/account.model";
import { BaseMetadata } from "model/base/base-metadata.response";
import React from "react";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";

export interface SelectContentProps<T> extends SelectProps<any> {
  [name: string]: any;

  fixedQuery?: any;
  data: T[];
  metadata: BaseMetadata;
  isLoading?: boolean;
  optionKeyValue: string;
  optionKeyName: string;
  defaultValue?: string | number | undefined | null
}

function SelectSearchPaging<T>({
  id: name,
  value,
  defaultValue,
  optionKeyValue,
  optionKeyName,
  mode = undefined,
  fixedQuery,
  key = "code",
  data = [],
  renderItem,
  metadata,
  maxTagCount = "responsive",
  notFoundContent = "Không có dữ liệu",
  onSearch = () => {},
  isLoading,
  ...rest
}: SelectContentProps<T>) {
  const handleSearch = (queryParams: AccountPublicSearchQuery) => {
    const query = { ...fixedQuery, ...queryParams };
    onSearch(query);
  };

  return (
    <SelectPagingV2
      id={name}
      mode={mode}
      loading={isLoading}
      defaultValue={defaultValue && { key: defaultValue }}
      metadata={metadata}
      labelInValue
      filterOption={false}
      showSearch
      allowClear
      maxTagCount="responsive"
      onSearch={(value) => handleSearch({ condition: value })}
      onClear={() => handleSearch({ condition: "" })}
      onPageChange={(key: string, page: number) => handleSearch({ condition: key, page: page })}
      notFoundContent={notFoundContent}
      {...rest}
    >
      {data.map((item: any, index) => {
        return (
          <Select.Option key={item[optionKeyValue]} value={item[optionKeyValue]}>
            {item[optionKeyName]}
          </Select.Option>
        )
      }) }
    </SelectPagingV2>
  );
}

export default SelectSearchPaging;
