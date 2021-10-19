import { Select } from "antd";
import { AppConfig } from "config/app.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type SelectMerchandisersProps = {
  isMulti?: boolean;
  hasSelectAll?: boolean;
  allowClear?: boolean;
};

SelectMerchandisers.defaultProps = {
  isMulti: false,
  hasSelectAll: false,
  allowClear: false,
};

function SelectMerchandisers(props: SelectMerchandisersProps) {
  const { isMulti, hasSelectAll, ...restProps } = props;
  const dispatch = useDispatch();
  const [merchadisers, setMerchadisers] = useState<Array<AccountResponse>>();

  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        (data: false | PageResponse<AccountResponse>) => {
          if (data) {
            setMerchadisers(data.items);
          }
        }
      )
    );
  }, [dispatch]);

  return (
    <Select
      showSearch
      optionFilterProp="children"
      showArrow
      placeholder="Chọn merchandisers"
      mode={isMulti ? "multiple" : undefined}
      style={{
        width: "100%",
      }}
      maxTagCount="responsive"
      {...restProps}
    >
      {merchadisers?.map((item) => (
        <Select.Option key={item.code} value={item.code}>
          {[item.code, item.full_name].join(" - ")}
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectMerchandisers;
