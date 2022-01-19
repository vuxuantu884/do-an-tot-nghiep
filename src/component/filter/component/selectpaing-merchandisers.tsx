import { Select } from "antd";
import SelectPaging from "component/custom/SelectPaging";
import { AppConfig } from "config/app.config";
import { AccountSearchAction, searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useCallback, useEffect, useState } from "react";
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
  const [wins, setWins] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return false;
      }
      setWins(data);
    },
    []
  );

  const getAccounts = useCallback((code: string, page: number) => {
    dispatch(
      searchAccountPublicAction(
        { condition: code, page: page, department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        setDataAccounts
      )
    );
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    dispatch(
      searchAccountPublicAction(
        { condition: "", page: 1, department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        setDataAccounts
      )
    );
  }, [dispatch]);

  return (
    <SelectPaging
      metadata={wins.metadata}
      placeholder="Chọn merchandiser"
      showSearch={false}
      showArrow
      allowClear
      {...restProps}
      searchPlaceholder="Tìm kiếm nhân viên"
      onPageChange={(key, page) => getAccounts(key, page)}
      onSearch={(key) => getAccounts(key, 1)}
    >
      {wins.items.map((item) => (
        <SelectPaging.Option key={item.code} value={item.code}>
          {`${item.code} - ${item.full_name}`}
        </SelectPaging.Option>
      ))}
    </SelectPaging>
  );
}

export default SelectMerchandisers;
