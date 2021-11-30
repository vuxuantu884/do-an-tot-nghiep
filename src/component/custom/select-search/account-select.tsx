import { Form, FormItemProps, Select } from "antd";
import { AccountSearchAction } from "domain/actions/account/account.action";
import _, { debounce } from "lodash";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { ReactElement, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

const {Option} = Select;
interface Props extends FormItemProps {
  label: string;
  name: string;
  rules?: any[];
  placeholder?: string;
  queryAccount?: AccountSearchQuery;
  mode?: "multiple" | "tags" | undefined;
  key?: "code" | "id";
  defaultValue?: string | number | string[];
}

AccountSearchSelect.defaultProps = {
  label: "Tài khoản",
  placeholder: "Chọn tài khoản",
  rules: [],
  queryAccount: {
    info: "",
  },
  mode: undefined,
  key: "code",
  defaultValue: undefined,
};

function AccountSearchSelect({
  label,
  placeholder,
  name,
  rules,
  mode,
  key,
  queryAccount,
  defaultValue,
  ...restFormProps
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [accountList, setAccountList] = React.useState<{
    items: Array<AccountResponse>;
    isLoading: boolean;
  }>({items: [], isLoading: false});

  const handleChangeAccountSearch = useCallback(
    (key: string, codes?: string[]) => {
      if (queryAccount) {
        setAccountList((prev) => {
          return {items: prev?.items || [], isLoading: true};
        });

        const query = _.cloneDeep(queryAccount);
        query.info = key;
        query.codes = codes;
        dispatch(
          AccountSearchAction(
            query,
            (response: PageResponse<AccountResponse> | false) => {
              if (response) {
                setAccountList({
                  items: response.items,
                  isLoading: false,
                });
              }
            }
          )
        );
      }
    },
    [dispatch, queryAccount]
  );
  const onSearchAccount = debounce((key: string) => {
    handleChangeAccountSearch(key);
  }, 300);

  useEffect(() => {
    if (mode === "multiple" && Array.isArray(defaultValue)) {
      handleChangeAccountSearch("", defaultValue);
    } else if(typeof defaultValue === "string") {
      handleChangeAccountSearch("", [defaultValue]);
    }else{
      handleChangeAccountSearch("");
    }
  }, [handleChangeAccountSearch, queryAccount?.info, mode, defaultValue]);

  return (
    <Form.Item label={label} name={name} rules={rules} {...restFormProps}>
      <Select
        mode={mode}
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={accountList?.isLoading}
        onSearch={(value) => onSearchAccount(value || "")}
        onClear={() => onSearchAccount("")}
        maxTagCount="responsive"
        defaultValue={defaultValue}
      >
        {accountList?.items?.map((account) => (
          <Option key={account.code} value={account[key || "code"]}>
            {`${account.code} - ${account.full_name}`}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}

export default React.memo(AccountSearchSelect, (prev, next) => {
  return prev.queryAccount?.info === next.queryAccount?.info;
});
