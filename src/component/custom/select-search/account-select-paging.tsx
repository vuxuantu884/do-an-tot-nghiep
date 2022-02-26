import { SelectProps } from "antd";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import _ from "lodash";
import { AccountPublicSearchQuery, AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
export interface SelectContentProps extends SelectProps<any> {
  fixedQuery?: any;
  isFilter?: boolean | false;
  [name: string]: any;
}
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

SelectSearch.defaultProps = {
  key: "code",
};

function SelectSearch(contentProps: SelectContentProps) {
  const { id: name, value, mode, fixedQuery, key, isFilter, ...selectProps } = contentProps;

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

  const [defaultOptons, setDefaultOptons] = useState<AccountResponse[]>([]);

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

  /**
   * Option cho trang 1
   */
  useEffect(() => {
    const getDefaultOptions = async () => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchAccountPublicApi,
        { ...fixedQuery, page: 1, limit: 30 }
      );
      setDefaultOptons(response?.items);
      setData(response);
    };
    getDefaultOptions();
  }, [dispatch, fixedQuery]);

  /**
   * Request giá trị mặc định để lên đầu cho select và thêm 1 số item khác để user cho thêm sự lựa cho
   */
  useEffect(() => {
    const getIntialValue = async () => {
      let initCodes: any;

      if (mode === "multiple" && Array.isArray(value)) {
        initCodes = value;
      } else if (typeof value === "string") {
        initCodes = [value];
      } else {
        initCodes = [];
      }

      if (initCodes.length > 0 && defaultOptons?.length > 0) {
        // call api lấy data của item(s) đang được chọn trước đó
        const initSelectedResponse = await callApiNative(
          { isShowError: true },
          dispatch,
          searchAccountPublicApi,
          {
            codes: isFilter ? JSON.parse(initCodes).code : initCodes,
            ...fixedQuery,
          }
        );

        let totalItems: AccountResponse[] = [];
        if (initSelectedResponse?.items && defaultOptons) {
          // merge 2 mảng, cho item(s) đang được chọn trước đó vào đầu tiên
          totalItems = _.uniqBy([...initSelectedResponse.items, ...defaultOptons], "code");
        } else if (defaultOptons) {
          totalItems = defaultOptons;
        } else if (initSelectedResponse?.items) {
          totalItems = initSelectedResponse.items;
        }

        setData((prevState) => ({ ...prevState, items: totalItems }));
      }
      setIsSearching(false);
    };
    getIntialValue().then();
  }, [dispatch, mode, value, fixedQuery, key, defaultOptons]);

  return (
    <SelectPagingV2
      {...defaultSelectProps}
      id={name}
      mode={mode}
      defaultValue={value}
      metadata={data?.metadata}
      loading={isSearching}
      onSearch={(value) => handleSearch({ condition: value })}
      onClear={() => handleSearch({ condition: "" })}
      onPageChange={(key: string, page: number) => {
        handleSearch({ condition: key, page: page });
      }}
      {...selectProps}
      >
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.code + name} value={isFilter ? JSON.stringify({
          code: item.code,
          name: item.full_name
        }) : item.code}>
          {`${item.code} - ${item.full_name}`}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );
}

const AccountSearchPaging = React.memo(SelectSearch, (prev, next) => {
  const { fixedQuery } = prev;
  const { fixedQuery: nextQuery } = next;
  return _.isEqual(fixedQuery, nextQuery);
});

export default AccountSearchPaging;
