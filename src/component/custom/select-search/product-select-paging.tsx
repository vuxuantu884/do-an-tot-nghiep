import { SelectProps } from "antd";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
import { RootReducerType } from "../../../model/reducers/RootReducerType";
import { ProductResponse, ProductWrapperSearchQuery } from "model/product/product.model";
import { searchProductWrapperApi } from "service/product/product.service";
import { searchProductWrapperRequestAction } from "domain/actions/product/products.action";
export interface SelectContentProps extends SelectProps<any> {
  merchandiser?: string;
  fixedQuery?: any;
  isFilter?: boolean | false;
  isGetName?: boolean | false;
  [name: string]: any;
}
const defaultSelectProps: SelectProps<any> = {
  placeholder: "Chọn mã 7",
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
  const {
    id: name,
    value,
    mode,
    fixedQuery,
    key,
    isFilter,
    isGetName,
    ...selectProps
  } = contentProps;

  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = React.useState(false);
  const [data, setData] = React.useState<PageResponse<ProductResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });

  const [defaultOptons, setDefaultOptons] = useState<ProductResponse[]>([]);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const handleSearch = (queryParams: ProductWrapperSearchQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };
    dispatch(
      searchProductWrapperRequestAction(
        query,
        (response: PageResponse<ProductResponse> | false) => {
          if (response) {
            setData(response);
          }
          setIsSearching(false);
        },
      ),
    );
  };

  useEffect(() => {
    if (contentProps.defaultValue) {
      const user: any = {
        code: contentProps?.defaultValue,
        full_name: contentProps?.merchandiser,
      };
      setData({ ...data, items: [user, ...data.items] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentProps.defaultValue]);

  /**
   * Option cho trang 1
   */
  useEffect(() => {
    const getDefaultOptions = async () => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchProductWrapperApi,
        { ...fixedQuery, page: 1, limit: 30 },
      );

      setDefaultOptons(response?.items ?? []);
      setData({ ...response });
    };
    getDefaultOptions();
  }, [dispatch, fixedQuery, userReducer]);

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
          searchProductWrapperApi,
          {
            codes: isFilter ? JSON.parse(initCodes).code : initCodes,
            ...fixedQuery,
          },
        );

        let totalItems: ProductResponse[] = [];
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
  }, [isFilter, dispatch, mode, value, fixedQuery, key, defaultOptons]);

  return (
    <SelectPagingV2
      {...defaultSelectProps}
      id={name}
      mode={mode}
      metadata={data?.metadata}
      loading={isSearching}
      onSearch={(value) => handleSearch({ info: value.trim() })}
      onClear={() => handleSearch({ info: "" })}
      onPageChange={(key: string, page: number) => {
        handleSearch({ info: key.trim(), page: page });
      }}
      filterOption={() => true} //lấy kết quả từ server
      {...selectProps}
      value={contentProps.defaultValue || value}
    >
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.code} value={item.code}>
          {item.code}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );
}

const ProductSearchPaging = React.memo(SelectSearch, () => {
  return false;
});

export default ProductSearchPaging;
