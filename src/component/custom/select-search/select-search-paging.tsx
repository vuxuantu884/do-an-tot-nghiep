import { SelectProps, Select } from "antd";
import { AccountPublicSearchQuery } from "model/account/account.model";
import { BaseMetadata } from "model/base/base-metadata.response";
import React, {ReactNode} from "react";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";

export interface SelectContentProps<T> extends SelectProps<any> {
  [name: string]: any;

  fixedQuery?: any;
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  metadata: BaseMetadata;
  isLoading?: boolean;
}

function SelectSearchPaging<T>({
  id: name,
  value,
  mode = undefined,
  fixedQuery,
  key = "code",
  data,
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
      defaultValue={value}
      metadata={metadata}
      showSearch
      showArrow
      allowClear
      optionFilterProp="children"
      maxTagCount="responsive"
      onSearch={(value) => handleSearch({ condition: value })}
      onClear={() => handleSearch({ condition: "" })}
      onPageChange={(key: string, page: number) => handleSearch({ condition: key, page: page })}
      notFoundContent={notFoundContent}
      {...rest}>
      {data.map((item, index) => renderItem(item,index)) }
    </SelectPagingV2>
  );
}

export default SelectSearchPaging;
