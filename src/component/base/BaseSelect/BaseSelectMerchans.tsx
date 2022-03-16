import React from "react";
import BaseSelectPaging from "./BaseSelectPaging";
import { Select } from "antd";
import { BaseSelectMerchandiserProps } from "./BaseSelect.type";

const { Option } = Select;
const BaseSelectMerchans = ({
  merchans,
  fetchMerchans,
  isLoadingMerchans,
  ...props
}: BaseSelectMerchandiserProps) => {
  return (
    <>
      <BaseSelectPaging
        metadata={merchans?.metadata}
        data={merchans?.items}
        renderItem={(item) => (
          <Option key={item.id} value={item.code}>
            {item.code} - {item.full_name}
          </Option>
        )}
        showArrow
        fetchData={fetchMerchans}
        loading={isLoadingMerchans}
        placeholder="Chọn Merchandiser"
        {...props}
      />
    </>
  );
};

export default BaseSelectMerchans;
