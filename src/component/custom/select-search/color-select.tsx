import { Form, FormItemProps, SelectProps } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { getColorAction } from "domain/actions/product/color.action";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { ColorResponse, ColorSearchQuery } from "model/product/color.model";
import React, { ReactElement, ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { colorSearchApi } from "service/product/color.service";
import { callApiNative } from "utils/ApiUtils";
import SelectPagingV2 from "../SelectPaging/SelectPagingV2";

export interface SelectSearchProps {
  form?: FormInstance;
  fixedQuery?: ColorSearchQuery;
  key?: "code" | "id"; 
  formItemProps?: FormItemProps<ReactNode>;
  selectProps?: SelectProps<any>;
  noFormItem?: boolean;
}

ColorSelect.defaultProps = {
  fixedQuery: {
    info: "",
  },
  key: "id", 
  noFormItem: false,
  selectProps: {
    placeholder: "Chọn màu sắc",
    mode: undefined,
    showArrow: true,
    optionFilterProp: "children",
    showSearch: true,
    allowClear: true,
    maxTagCount: "responsive",
    notFoundContent: "Không có dữ liệu",
  },
};

function ColorSelect({
  form,
  key,
  fixedQuery, 
  formItemProps,
  selectProps,
  noFormItem,
}: SelectSearchProps): ReactElement {
  const name = formItemProps?.name || "";
  const { mode, defaultValue } = selectProps!;
  const dispatch = useDispatch();
  const [isSearching, setIsSearching] = React.useState(false);
  const [data, setData] = React.useState<PageResponse<ColorResponse>>({
    items: [],
    metadata: {
      page: 1,
      limit: 30,
      total: 0,
    },
  });

  const handleColorSearch = (queryParams: ColorSearchQuery) => {
    setIsSearching(true);
    const query = { ...fixedQuery, ...queryParams };

    dispatch(
      getColorAction(query, (response: PageResponse<ColorResponse>) => {
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
          colorSearchApi,
          {
            ids: initParams,
          }
        );

        // call api lấy thêm data nối vào sau để người dùng có thể chọn item khác
        const defaultItems = await callApiNative({ isShowError: true }, dispatch, colorSearchApi);

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
        const defaultItems = await callApiNative({ isShowError: true }, dispatch, colorSearchApi);
        setData(defaultItems);
      }
      setIsSearching(false);
    };

    getIntialValue();
  }, [formFieldValue, mode, defaultValue, dispatch, key]);

  const SelectContent = (
    <SelectPagingV2
      {...selectProps} 
      metadata={data.metadata}
      loading={isSearching}
      onSearch={(value) => handleColorSearch({ info: value })}
      onClear={() => handleColorSearch({ info: "" })}
      onPageChange={(key: string, page: number) => {
        handleColorSearch({ info: key, page: page });
      }}>
      {data?.items?.map((item) => (
        <SelectPagingV2.Option key={item.name} value={item[key!]}>
          {`${item.code}-${item.name}`}
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

const ColorSearchSelect = React.memo(ColorSelect, (prev, next) => {
  const { form, fixedQuery } = prev;
  const { form: nextForm, fixedQuery: nextQuery } = next;
  return form === nextForm  && fixedQuery === nextQuery;
});
export default ColorSearchSelect;
