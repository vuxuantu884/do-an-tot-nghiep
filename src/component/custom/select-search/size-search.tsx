import { Form, SelectProps } from "antd";
import { sizeSearchAction } from "domain/actions/product/size.action";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { SizeQuery, SizeResponse } from "model/product/size.model";
import React, { ReactElement, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSearchSize } from "service/product/size.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";
import { SelectSearchProps } from "./color-select";

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
  key: "id",
  noFormItem: false,
};

function SizeSelect({
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
  const [data, setData] = React.useState<PageResponse<SizeResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });

  const handleSizeSearch = (queryParams: SizeQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };
    dispatch(
      sizeSearchAction(query, (response: PageResponse<SizeResponse>) => {
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
      } else if (typeof value === "string" || typeof value === "number") {
        initParams = [Number(value)];
      } else {
        initParams = [];
      }

      if (initParams.length > 0) {
        // call api lấy data của item(s) đang được chọn trước đó
        const initSelectedResponse = await callApiNative(
          { isShowError: true },
          dispatch,
          getSearchSize,
          {
            ids: initParams,
          }
        );

        // call api lấy thêm data nối vào sau để người dùng có thể chọn item khác
        const defaultItems = await callApiNative({ isShowError: true }, dispatch, getSearchSize);

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
        const defaultItems = await callApiNative({ isShowError: true }, dispatch, getSearchSize);
        setData(defaultItems);
      }
      setIsSearching(false);
    };
    getIntialValue();
  }, [dispatch, formFieldValue, defaultValue, key, mode]);

  const SelectContent = (
    <SelectPagingV2
      {...defaultSelectProps}
      {...selectProps}
      metadata={data.metadata}
      loading={isSearching}
      onSearch={(value) => handleSizeSearch({ code: value })}
      onClear={() => handleSizeSearch({ code: "" })}
      onPageChange={(key: string, page: number) => {
        handleSizeSearch({ code: key, page: page });
      }}>
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.code} value={item[key!]}>
          {`${item.code}`}
        </SelectPagingV2.Option>
      ))}
    </SelectPagingV2>
  );

  if (noFormItem) {
    return <>{SelectContent}</>;
  } else {
    return (
      <Form.Item name={name} {...formItemProps}>
        {SelectContent}
      </Form.Item>
    );
  }
}

const SizeSearchSelect = React.memo(SizeSelect, (prev, next) => {
  const { form, fixedQuery } = prev;
  const { form: nextForm, fixedQuery: nextQuery } = next;
  return form === nextForm && fixedQuery === nextQuery;
});
export default SizeSearchSelect;
