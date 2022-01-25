import { Form, SelectProps } from "antd";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import _ from "lodash";
import { AccountPublicSearchQuery, AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { ReactElement, useEffect } from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
import { SelectSearchProps } from "./color-select";

const defaultSelectProps: SelectProps<any> = {
  placeholder: "Chọn tài khoản",
  mode: undefined,
  showArrow: true,
  optionFilterProp: "children",
  showSearch: true,
  allowClear: true,
  maxTagCount: "responsive",
  notFoundContent: "Không có dữ liệu",
};

AccountSelect.defaultProps = {
  fixedQuery: {
    condition: "",
  },
  key: "code",
  noFormItem: false,
};

function AccountSelect({
  form,
  key,
  fixedQuery,
  formItemProps,
  noFormItem,
  selectProps,
}: SelectSearchProps): ReactElement {
  const name = formItemProps?.name || "";
  const { mode, defaultValue } = selectProps!;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = React.useState(false);
  const [data, setData] = React.useState<PageResponse<AccountResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });

  const handleSearch = (queryParams: AccountPublicSearchQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };
    dispatch(
      searchAccountPublicAction(query, (response: PageResponse<AccountResponse>) => {
        if (response) {
          setData(response);
        }
        setIsSearching(false);
      })
    );
  };

  const formFieldValue = form && name ? form?.getFieldValue(name) : null;

  /**
   * Request giá trị mặc định để lên đầu cho select và thêm 1 số item khác để user cho thêm sự lựa cho
   */
  useEffect(() => {
    const getIntialValue = async () => {
      let value = formFieldValue;
      let initParams: any = [];

      if (defaultValue) {
        value = defaultValue;
      }

      if (mode === "multiple" && Array.isArray(value)) {
        initParams = value;
      } else if (typeof value === "string") {
        initParams = [value];
      } else {
        initParams = [];
      }

      if (initParams.length > 0) {
        // call api lấy data của item(s) đang được chọn trước đó
        const initSelectedResponse = await callApiNative(
          { isShowError: true },
          dispatch,
          searchAccountPublicApi,
          {
            codes: initParams,
          }
        );

        // call api lấy thêm data nối vào sau để người dùng có thể chọn item khác
        const defaultItems = await callApiNative(
          { isShowError: true },
          dispatch,
          searchAccountPublicApi
        );

        let totalItems = [];
        if (initSelectedResponse?.items && defaultItems?.items) {
          // merge 2 mảng, cho item(s) đang được chọn trước đó vào đầu tiên
          totalItems = _.uniqBy([...initSelectedResponse.items, ...defaultItems.items], key!);
        } else if (defaultItems?.items) {
          totalItems = defaultItems.items;
        } else if (initSelectedResponse?.items) {
          totalItems = initSelectedResponse.items;
        }

        setData({ ...defaultItems, items: totalItems });
      } else {
        const defaultItems = await callApiNative(
          { isShowError: true },
          dispatch,
          searchAccountPublicApi
        );
        setData(defaultItems);
      }
      setIsSearching(false);
    };
    getIntialValue();
  }, [dispatch, formFieldValue, defaultValue, key, mode]);

  const SelectContent = ()=>(
    <SelectPagingV2
      {...defaultSelectProps}
      {...selectProps}
      metadata={data?.metadata}
      loading={isSearching}
      onSearch={(value) => handleSearch({ condition: value })}
      onClear={() => handleSearch({ condition: "" })}
      onPageChange={(key: string, page: number) => {
        handleSearch({ condition: key, page: page });
      }}>
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.code + name} value={item[key!]}>
          {`${item.code} - ${item.full_name}`}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );

  if (noFormItem) {
    return <SelectContent/>;
  } else {
    return (
      <Form.Item name={name} {...formItemProps}>
        <SelectContent/>
      </Form.Item>
    );
  }
}

// const AccountSearchPaging = React.memo(AccountSelect, (prev, next) => {
//   const { form, fixedQuery } = prev;
//   const { form: nextForm, fixedQuery: nextQuery } = next;
//   return form === nextForm && fixedQuery === nextQuery;
// });
export default AccountSelect;
// export default AccountSearchPaging;
