import {Form, Select, SelectProps} from "antd";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {debounce} from "lodash";
import {AccountResponse, AccountSearchQuery} from "model/account/account.model";
import {PageResponse} from "model/base/base-metadata.response";
import React, {ReactElement, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";

const {Option} = Select;
interface Props extends SelectProps<string> {
  lable: string;
  name: string;
  rules?: any[];
  placeholder?: string;
  queryAccount?: AccountSearchQuery;
}

AccountSearchSelect.defaultProps = {
  lable: "Tài khoản",
  placeholder: "Chọn tài khoản",
  rules: [],
  queryAccount: {
    info: "",
  },
};

export default function AccountSearchSelect({
  lable,
  placeholder,
  name,
  rules,
  queryAccount,
  ...restProps
}: Props): ReactElement {
  const dispatch = useDispatch();
  const [accountList, setAccountList] = React.useState<{
    items: Array<AccountResponse>;
    isLoading: boolean;
  }>({items: [], isLoading: false});

  const handleChangeAccountSearch = useCallback(
    (key: string) => {
      if (queryAccount) {
        setAccountList((prev) => {
          return {items: prev?.items || [], isLoading: true};
        });
        console.log(key);
        queryAccount.info = key;
        dispatch(
          AccountSearchAction(
            queryAccount,
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
    console.log(key);

    handleChangeAccountSearch(key);
  }, 300);

  useEffect(() => {
    handleChangeAccountSearch("");
  }, [handleChangeAccountSearch]);
  return (
    <Form.Item label={lable} name={name} rules={rules}>
      <Select
        mode="multiple"
        placeholder={placeholder}
        showArrow
        optionFilterProp="children"
        showSearch
        allowClear
        loading={accountList?.isLoading}
        onSearch={(value) => onSearchAccount(value)}
        {...restProps}
      >
        {accountList?.items?.map((account) => (
          <Option key={account.id} value={account.id}>
            {account.full_name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  );
}
