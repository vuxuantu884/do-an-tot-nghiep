import { SelectProps } from "antd";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { SizeQuery, SizeResponse } from "model/product/size.model";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getSearchSize } from "service/product/size.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
import { SelectContentProps } from "./account-select-paging";

const defaultSelectProps: SelectProps<any> = {
  placeholder: "Chọn kích cỡ",
  mode: undefined,
  showArrow: true,
  optionFilterProp: "children",
  showSearch: true,
  allowClear: true,
  maxTagCount: "responsive",
  notFoundContent: "Không có dữ liệu",
};

SizeSelect.defaultProps = {
  querySearch: {
    code: "",
  },
};

function SizeSelect(props: SelectContentProps): ReactElement {
  const { id: name, value, mode, fixedQuery, key, ...selectProps } = props;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = React.useState(false);
  const [data, setData] = React.useState<PageResponse<SizeResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });
  const [defaultOptons, setDefaultOptons] = useState<SizeResponse[]>([]);

  const handleSizeSearch = async (queryParams: SizeQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };
    const response = await callApiNative({ isShowError: true }, dispatch, getSearchSize, query);
    if (response) {
      setData(response);
    }
    setIsSearching(false);
  };

  /**
   * Option cho trang 1
   */
  useEffect(() => {
    const getDefaultOptions = async () => {
      const response = await callApiNative({ isShowError: true }, dispatch, getSearchSize, {
        ...fixedQuery,
        page: 1,
        limit: 30,
      });
      setDefaultOptons(response.items);
      setData(response);
    };
    getDefaultOptions();
  }, [dispatch, fixedQuery]);

  /**
   * Request giá trị mặc định để lên đầu cho select và thêm 1 số item khác để user cho thêm sự lựa cho
   */
  useEffect(() => {
    const getIntialValue = async () => {
      let initIds: any = [];

      if (mode === "multiple" && Array.isArray(value)) {
        initIds = value;
      } else if (typeof value === "string" || typeof value === "number") {
        initIds = [Number(value)];
      } else {
        initIds = [];
      }

      if (initIds.length > 0) {
        // call api lấy data của item(s) đang được chọn trước đó
        const initSelectedResponse = await callApiNative(
          { isShowError: true },
          dispatch,
          getSearchSize,
          {
            ids: initIds,
          }
        );

        let totalItems: SizeResponse[] = [];
        if (initSelectedResponse?.items && defaultOptons?.length > 0) {
          // merge 2 mảng, cho item(s) đang được chọn trước đó vào đầu tiên
          totalItems = _.uniqBy([...initSelectedResponse.items, ...defaultOptons], key!);
        } else if (defaultOptons) {
          totalItems = defaultOptons;
        } else if (initSelectedResponse?.items) {
          totalItems = initSelectedResponse.items;
        }

        setData((prevState) => ({ ...prevState, items: totalItems }));
      }
      setIsSearching(false);
    };
    getIntialValue();
  }, [dispatch, key, mode, value, defaultOptons]);

  return (
    <SelectPagingV2
      {...defaultSelectProps}
      {...selectProps}
      defaultValue={value}
      mode={mode}
      metadata={data.metadata}
      loading={isSearching}
      onSearch={(value) => {
        handleSizeSearch({ code: value });
      }}
      onClear={() => handleSizeSearch({ code: "" })}
      onPageChange={(key: string, page: number) => {
        handleSizeSearch({ code: key, page: page });
      }}>
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.code} value={item.id}>
          {`${item.code}`}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );
}

const SizeSearchSelect = React.memo(SizeSelect, (prev, next) => {
  const { value } = prev;
  const { value: nextValue } = next;
  return value === nextValue;
});
export default SizeSearchSelect;
