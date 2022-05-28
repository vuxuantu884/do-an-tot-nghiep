import React from "react";
import BaseSelectPaging from "./BaseSelectPaging";
import { Select } from "antd";
import { BaseSelectMerchandiserProps } from "./BaseSelect.type";

const { Option } = Select;
const BaseSelectMerchans = ({
  merchans,
  fetchMerchans,
  isLoadingMerchans,
  placeholder,
  ...props
}: BaseSelectMerchandiserProps) => {
  return (
    <>
      <BaseSelectPaging
        metadata={merchans?.metadata}
        data={merchans?.items}
        renderItem={(item) => (
          <Option key={item.code} value={item.code}>
            {item.code} - {item.full_name}
          </Option>
        )}
        showArrow
        fetchData={fetchMerchans}
        loading={isLoadingMerchans}
        placeholder={placeholder ?? "Chọn Merchandiser"}
        {...props}
      />
    </>
  );
};

export default BaseSelectMerchans;
